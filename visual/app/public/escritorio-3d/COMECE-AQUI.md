# Escritório 3D: a parte visual, pronta

Escritórios montados em 3D, móveis e funcionários animados, em arquivos GLB (padrão glTF 2.0). Feito para Three.js e React Three Fiber; o Blender também importa.

Claude: leia este arquivo inteiro antes de usar o pacote. As regras da seção "Como o 3D está montado" evitam os erros mais comuns.

## O que tem aqui

| Pasta | O que é |
|---|---|
| `escritorios/` | 13 escritórios vazios, de uma sala só até a sede de vidro com 277 postos. Cada um tem `<id>.glb` (o 3D), `<id>.json` (lugares, salas e planta) e `<id>.webp` (prévia). A lista completa está em `indice.json`. |
| `moveis/` | 82 móveis e objetos, um `.glb` cada. Medidas, lugares e camadas estão em `catalogo.json`; a folha `moveis.webp` mostra todos. |
| `funcionarios/` | 8 funcionários com 12 animações cada. Detalhes em `funcionarios.json`; a prévia é `funcionarios.webp`. |
| `visualizador/` | Página que abre os escritórios e coloca funcionários nos lugares livres. Usa só three.js, que já vem na pasta `vendor/`. |
| `servir.mjs` | Abre o visualizador no seu computador. |

## Ver agora (1 comando)

```bash
node servir.mjs
```

Abra o endereço que aparecer (normalmente http://localhost:4173/visualizador/). Escolha o escritório no topo e use **+ Funcionário**. Para tirar alguém, toque nele.

Se aparecer "Não achei os arquivos do pacote", você abriu o `index.html` direto. Abra pelo `servir.mjs`.

## Escritórios

| id | Andares | Para quê |
|---|---|---|
| `sede-200` | 3 | Prédio de vidro da demo: recepção, estúdio, reuniões, diretoria e terraço na cobertura. O entorno (praça, ruas e cidade) está à parte, em `sede-200-entorno.glb`. |
| `startup-enxuta`, `agencia-criativa`, `comercial`, `diretoria-equipe` | 1 | Uma sala, de 10 × 8 m. |
| `sede-compacta`, `open-space` | 1 | 14 × 10 m. |
| `open-space-grande`, `central-operacoes` | 1 | Andar grande. |
| `edificio-3-andares`, `edificio-compacto-3-andares` | 3 | Prédio com elevador. |
| `torre-5-andares`, `torre-compacta-5-andares` | 5 | Torre com diretoria no topo. |

O número de postos e de lugares de cada escritório está em `escritorios/indice.json`.

## Como o 3D está montado

- **Unidades:** tudo em metros, com y para cima.
- **Móveis:** a frente aponta para +z. A origem fica no centro da pegada, no chão.
- **Andares:** cada escritório tem os nós `andar_0`, `andar_1` e assim por diante.
  - Para ver um andar por dentro, esconda os andares acima dele.
  - Os nós com `userData.teto = true` são o teto. Esconda-os para ver o interior.
- **Móveis dentro do escritório:** ficam no grupo `moveis` de cada andar, um nó por móvel. O nome do nó é o id do catálogo; `userData.movel` repete o id e `userData.id` é o id do item na planta. Na sede, os móveis vêm juntos numa malha só por andar.
- **Malha dentro de grupo:** os arquivos usam `KHR_mesh_quantization`, então cada malha fica dentro de um grupo com o mesmo nome. Mexa no grupo, não na malha de dentro.
  - O `GLTFLoader` do three.js e o `useGLTF` do drei leem isso direto.
  - O Blender também importa.
- **Lugares:** ficam em `escritorios/<id>.json`, na chave `assentos`.
  - Cada lugar tem: `x`, `y` (chão do andar), `z`, `yaw` (rotação em y), `altura` do assento e `pose`.
  - Também traz `trabalho` (true quando tem mesa na frente) e `sala`.
  - Os pontos de pausa (café, água, sofá) estão em `pontos`.
- **Funcionário:** a origem fica entre os pés, no chão, com a frente para +z. O corpo é uma hierarquia de juntas (`quadril`, `tronco`, `cabeca`, `braco_E`, `antebraco_D` e as outras), sem esqueleto de pele.
- **Animações:** `parado`, `andando`, `digitando`, `notebook`, `sentado`, `sofa`, `digitando_em_pe`, `conversando`, `telefone`, `cafe`, `apresentando` e `acenando`. Todas em loop.
- **Pôr alguém sentado:**
  - Posição da raiz: `x`, `y + altura − 0,47`, `z`. Os clipes sentados foram gravados com assento a 0,47 m.
  - Rotação y: `yaw`.
  - Clipe pela pose do lugar:

    | Pose do lugar | Clipe |
    |---|---|
    | `type` | `digitando` |
    | `laptop` | `notebook` |
    | `rest` | `sentado` |
    | `lounge` | `sofa` |
    | `stand` | `digitando_em_pe` (sem descontar a altura) |

- **Cores:** nos móveis, o material `cor_variavel` aceita qualquer cor; as sugestões estão em `catalogo.json`. Nos funcionários, os materiais se chamam `pele`, `roupa`, `cabelo`, `detalhe` e `metal`.
- **Letreiro:** os letreiros da sede são planos com textura, chamados `letreiro_*`. Esconda-os ou troque a textura pela sua marca.

## Usar no seu app

### React Three Fiber (drei)

```tsx
import { useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

const CLIPE = { type: "digitando", laptop: "notebook", rest: "sentado", lounge: "sofa", stand: "digitando_em_pe" } as const;

export function Escritorio({ id }: { id: string }) {
  const { scene } = useGLTF(`/escritorio-3d/escritorios/${id}.glb`);
  useEffect(() => scene.traverse((o) => { if (o.userData.teto) o.visible = false; }), [scene]);
  return <primitive object={scene} />;
}

type Assento = { x: number; y: number; z: number; yaw: number; altura: number; pose: keyof typeof CLIPE };

export function Funcionario({ arquivo, assento }: { arquivo: string; assento: Assento }) {
  const { scene, animations } = useGLTF(arquivo);
  const boneco = useMemo(() => scene.clone(true), [scene]); // um clone por funcionário
  const { actions } = useAnimations(animations, boneco);
  useEffect(() => void actions[CLIPE[assento.pose]]?.play(), [actions, assento.pose]);
  const y = assento.y + (assento.pose === "stand" ? 0 : assento.altura - 0.47);
  return <primitive object={boneco} position={[assento.x, y, assento.z]} rotation-y={assento.yaw} />;
}
```

Copie a pasta `escritorio-3d` para `public/` do app para os caminhos acima funcionarem.

### Three.js puro

Veja `visualizador/app.js`: carregar, enquadrar a câmera, esconder andar e teto, e pôr funcionários sentados. Mesmo sem o `servir.mjs`, o `GLTFLoader` normal abre os arquivos.

## Pedidos prontos para o Claude

1. `Leia escritorio-3d/COMECE-AQUI.md e monte no meu app a cena com o escritório edificio-3-andares: câmera orbital, luz de fim de tarde e um seletor de andar.`
2. `Coloque um funcionário em cada posto de trabalho de escritorio-3d/escritorios/startup-enxuta.json, sentado e digitando, variando entre os 8 modelos de escritorio-3d/funcionarios.`
3. `Crie um botão "Contratar" que põe um funcionário no próximo lugar livre e uma lista lateral mostrando quem está em cada mesa.`
4. `Monte um escritório novo só com os móveis de escritorio-3d/moveis, respeitando pegada, camada e superficie do catalogo.json, sem móveis sobrepostos.`
5. `Troque a cor do material cor_variavel dos móveis e o letreiro da sede pela cor e pelo nome da minha empresa.`

## Licença

Uso livre nos seus projetos, pessoais e comerciais. Não revenda o pacote como está.

O three.js, na pasta `visualizador/vendor`, é MIT; a licença está em `three-LICENSE.txt`.

Pacote do guia "Construa seu escritório de IA do zero": https://iacom.com.br/buildoffice
