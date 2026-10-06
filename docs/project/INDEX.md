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
For current production direction, read the
[Project revival roadmap](../plans/PROJECT_REVIVAL_ROADMAP.md), then the
[recovered old design-bible authority map](../archive/OLD_DESIGN_BIBLE_RECOVERY.md)
and the [100-module rehabilitation audit](../content/MODULE_CATALOGUE_REHAB_V1.md).
For the R1 design-review gate, read the
[source audit and contradiction report](../content/R1_CATALOGUE_SOURCE_AUDIT.md),
[100 functional-role contracts](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[module-definition draft](../design/MODULE_DEFINITION_DRAFT.md) and
[patch-family coverage witnesses](../content/R1_PATCH_FAMILY_COVERAGE.md).
R1/R1A are closed with [four accepted amendments](../plans/R1_ACCEPTANCE_AMENDMENTS.md).
The corrected packet covers 16 families. The separately authorized
[R2 seam is accepted and closed](R2_DATA_DRIVEN_PATCH_SEAM.md), preserving
the seven current behaviors and v1 saves.
[R3-A starter-system design](../plans/R3A_STARTER_SYSTEM_DESIGN.md) passes in direction;
all four graphs are accepted targets for the separately authorized
[R3-S behavior substrate](R3S_STARTER_SUBSTRATE.md), now implemented with isolated
native fixtures, event/domain contracts and rendered evidence. Stop before R3-B;
auditory review, inventory fairness, capacity and new persistence remain review
gates. Historical metadata annotations do not require renewed broad research.
Next, read [G1 — Game Structure / Progression Prototype](../plans/G1_GAME_STRUCTURE_PROPOSAL.md).
Its [G1-D decision packet](../plans/G1_D_DECISION_PACKET.md) now records accepted
D1–D10 directions and provisional content recommendations. The user's subsequent
working-slice order authorized [G1-P, now implemented](G1_P_STUDIO_SLICE.md).
The governing sequence puts game structure, rack experience, content and an
end-to-end playable run before serious audio fidelity. Audio architecture and
actual cable authority remain requirements throughout.
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
