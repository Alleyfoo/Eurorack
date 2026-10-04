# Eurorack baseline documentation

S0, inspected 2026-10-04 at baseline commit `96b100815114fbc71bd49f257a8b8fe96a81bb39`.
These documents describe the prototype at that commit; they do not authorize
implementation or silently redefine current behavior.

During S0, separate pixel-art documentation/prototype commits `5753226` and
`57f923f` appeared in the shared branch, plus a working change to
`design/pixel-rack-prototype.html`. They are separate visual-design work, not
active application/audio authority. S0 leaves that working change unstaged.
The proposed pixel-art implementation plan does not authorize gameplay work
or override the governing design established here.

## Read in this order

For the implemented S1-A slice, read [Visible patch authority](S1_A_PATCH_AUTHORITY.md).
The documents below remain the S0 baseline archaeology.

1. [Current system](CURRENT_SYSTEM.md): runtime and ownership authority.
2. [Gameplay map](GAMEPLAY_MAP.md): implemented actions and reachability.
3. [Audio model](AUDIO_MODEL.md): what actually produces sound.
4. [State model](STATE_MODEL.md): persistence and local state.
5. [Known quirks](KNOWN_QUIRKS.md): confirmed issues, validation, and untested paths.
6. [Extension boundaries](EXTENSION_BOUNDARIES.md): preservation and replacement seams.
7. [Governing design](../design/GAME_DESIGN.md): locked direction, examples, and questions.
8. [S1 proposal](../plans/S1_PATCH_SANDBOX_PROPOSAL.md): a proposed experiment, not approval to implement.

## Authority and evidence

Root `App.tsx` is the active application. `src/App.tsx` is outside the active
import graph and must remain untouched in S0. The current runtime is authoritative
for archaeology; the governing design is authoritative for future direction.
When these disagree, record the difference rather than pretending the design
has already been implemented.

Source references use repository-relative paths and symbol names so they remain
searchable after line numbers move. Behavioral claims marked source-confirmed
follow actual reads, writes, handlers, and connections. A label of REACHABLE
establishes a route in the source; it does not claim a complete browser playtest.

The isolated Chromium smoke verified initial opening, tutorial/rack entry,
user-gesture audio activation with nonzero analyser samples, one job cable,
job completion, and reload of a save created during that test. It did not inspect
a personal browser save or establish musical quality. See [validation details](KNOWN_QUIRKS.md#s0-validation).

The central finding: **job cables govern score, not the audible graph**. The
living rack uses deck slots as three repeating 16-step rows. Its global controls
and positional sound generation are a separate system from job patch simulation.
