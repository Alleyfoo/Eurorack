# Extension boundaries

Baseline: `96b1008`. Future direction is governed by
[GAME_DESIGN.md](../design/GAME_DESIGN.md). S0 preserves every gameplay system,
both App files, the save schema and the audio implementation.

## Preservation and provisional status

| Existing piece | Preserve now / future use boundary |
|---|---|
| Root `App.tsx` and current loop | Current runtime authority and regression reference. Keep progression intact while any later sandbox is opt-in. Avoid putting a second synth model into JobView's numerical simulation. |
| Deck and storage schema | Preserve existing players' module/progression data. A proposed sandbox patch is separate session data; no silent reinterpretation of the ordered deck as a cable graph. Migration needs explicit future design and validation. |
| Module/card visual vocabulary | Reuse the feel, port colors and interaction primitives where useful. Numeric voltage/rarity labels and name-based DSP claims are provisional. Layout and truthful controls need adaptation to behavior-defined modules. |
| Knob/Button | Useful existing direct-input primitives. Any later changes require focus/touch/pointer behavior validation; do not rewrite the whole UI merely to extract them. |
| Job cable record/gesture/SVG approach | Useful starting representation and interaction idea. Requires typed endpoints, individual removal, self-patching policy and layout-derived coordinates; current paths are not graph authority. |
| Oscilloscope | Reuse rendering against an injected/selected master analyser. Its current accessor initializes the old engine, so using it unchanged would start unwanted legacy sound in a sandbox. |
| Audio master/recording concepts | Preserve compressor, output clamp, analyser and limited-stream capture approach. Extract lifecycle ownership and verify overload/capture rather than blindly sharing the old singleton. |
| Global living-rack sequencer | Keep as prototype behavior. It is a positional groove generator, not a per-module runtime; replacing just playPatch cannot make it support arbitrary routing. |
| gameLogic scoring | Preserve for existing jobs. Provisional for new direction: presence bonuses, generic cable bonuses and score-derived silence conflict with the locked design. It must not judge the S1 sandbox. |
| Catalogue, characters, economies, quests/bosses | Retain data and handlers in S0. Classification in GAME_DESIGN is an assessment, not deletion approval or a commitment to future integration. |
| `src/App.tsx` | Preserve unused alternate file. Compare intentionally before any future consolidation; do not merge its changes by assumption. |

## Future ownership seam

An S1 sandbox should own module instances, positions, controls and cables in one
patch state. A dedicated runtime applies that state to real audio/CV/gate
connections, with explicit start, edit, mute and disposal. UI indicators can
observe that runtime; scalar RPG scoring has no authority over whether a patch
is meaningful, audible, silent or successful.

The existing engine cannot support this through configuration alone: it has no
module-node registry, typed modulation targets, gate event routes, cable
connection/disconnection, or disposal API. Reuse working primitives at the
boundary; isolate the fixed sequencer rather than treating its module names as
DSP implementations. The S1 proposal gives a scoped path, not an app rewrite.

## Constraints on any next milestone

- No S1 implementation is authorized by these documents. Follow-up authorization
  must establish the experiment and any fixes required for it.
- Do not start the legacy scheduler/background noise alongside sandbox audio;
  audible effects must be attributable to the displayed patch.
- Keep existing save behavior and origin data intact. Any new patch persistence
  is an OPEN QUESTION, not a reason to change PlayerState during S0.
- Signal families must have distinct meaning, and every enabled control must
  affect that module or be visibly identified as unavailable.
- Preserve intentional instability and feedback while bounding final browser
  output. An output safety boundary is not a musical correctness evaluator.
- Avoid implicit 16-step, scale-quantized or subtractive-chain defaults becoming
  global constraints on noise, drones, silence, and irregular systems.
- Verify smallest audible graph relationships before integrating economy,
  encounters, rarities or a large catalogue.

For exact proposed scope and pass/fail questions, read
[S1 patch sandbox proposal](../plans/S1_PATCH_SANDBOX_PROPOSAL.md).
