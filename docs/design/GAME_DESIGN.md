# Governing game design

S0, 2026-10-04. This document records the user's governing direction, not the
current prototype's implemented capabilities. See [baseline index](../project/INDEX.md)
for baseline behavior, [S1-A patch authority](../project/S1_A_PATCH_AUTHORITY.md)
for the implemented routing seam, and [G1 proposal](../plans/G1_GAME_STRUCTURE_PROPOSAL.md)
for the next milestone. The remaining full S1 proposal is provisional.

## Authority labels — LOCKED DESIGN

- **LOCKED DESIGN**: established premise, values or direction. Future milestones
  must honor it; it does not imply all features must ship in S1.
- **ILLUSTRATIVE**: a way to explore or explain a direction. Examples, module sets,
  measurements and implementation sketches are not mandatory requirements.
- **OPEN QUESTION**: a decision or hypothesis not yet settled. Document evidence
  before choosing; do not promote it to a rule through implementation accident.

Current source is authoritative about current behavior. This document governs
future design. Existing systems stay intact during S0 even where they conflict
with this direction. No gameplay implementation or removal is authorized in S0.

## Core premise — LOCKED DESIGN

This is a Eurorack-inspired game about building small modular systems, patching
them, listening, changing relationships, discovering behavior and capturing
interesting results. The player is not solving a synthesizer. The player creates
a system, pushes it, listens to what it becomes, and learns how to influence it.

House principle:

**MUSICALLY RECOGNIZABLE. PHYSICALLY SUGGESTIVE. TECHNICALLY SIMPLIFIED.**

Relationships should suggest modular instruments without requiring a calibrated
electrical engineering simulator. Technical simplification must preserve the
player's ability to hear and influence the patch's behavior.

## Adventure pace — LOCKED DESIGN

This is a **low-pressure adventure**. The game waits for the player.

While the player is patching, listening or simply leaving a system running, the
game must not create an accumulating burden of messages, meetings, chores,
deadlines or expiring routine obligations. Curiosity should pull the player toward
the next place, person or machine; obligation should not push them there.

Opportunities may quietly become available and remain available. Later optional
situated events may have real timing or one-shot stakes only when their fiction
and gameplay justify it. Constant workplace-style attention pressure is not a
default progression tool.

The persistent rack is home: adventures introduce strange possibilities into
that calm space rather than turning the studio into a task manager.

## Musical values — LOCKED DESIGN

Noise is valid music. The game must support and respect noise, drones, irregular
rhythm, feedback, clipping/saturation, unstable modulation, self-modulation,
chaotic control, non-4/4 structures, non-tonal sound, silence, slowly evolving
systems and patches that are difficult to control. These are not automatic
failure states. Interesting instability is content.

Do not normalize every patch into a polite tonal sequence. Safety and performance
constraints may bound execution and final output, but they must not rank tonality,
regularity or controllability as universally superior musical results.

## Core loop — LOCKED DESIGN

**PATCH → LISTEN → CHANGE → DISCOVER → CAPTURE / PERFORM**

The interesting part is the behavior of the patch. Buying modules and progression
exist to create new relationships, not merely larger scores. A player should be
able to relate an edit to an audible consequence, including deliberate silence,
and explore an evolving system without constant economic interruption.

## Studio and project structure — LOCKED DESIGN

**D1-B — accepted:** persistent studio, finite projects. The player's studio,
owned modules, discoveries and archive persist. Projects provide finite
beginnings, situations and deliberate closing points. Closing a project does
not reset the studio or destroy a patch.

**D8-A — accepted for G1-P:** projects finish when the player chooses a
result/version to keep and closes the project. The game does not judge whether
that result is musically good.

**Overall studio ending — OPEN / DEFERRED:** G1-P must not impose a final ending
on the studio. A later authored chapter or finale may be considered if the full
game benefits from it; the studio remains usable afterward.

### Starter kit — LOCKED DESIGN

**Post-G1 full-game direction:** D2-A below remains the accepted starter for the
implemented G1-P structure test; it is **not** the target richness of the finished
game. The full game should begin from one of a few **working, dismantlable starter
patches/racks** built from ordinary module instances and explicit cables. A starter
is an example, not a correct answer.

The initial instrument must already support several meaningful relationships and
an interesting audible state; the player should not be forced to listen to a bare
sine wave while earning basic synthesis functionality. Exact starter contents,
preset count and installed capacity remain open for starter-system review and
playtesting. R1/R2 are accepted; [R3-A](../plans/R3A_STARTER_SYSTEM_DESIGN.md) proposes
four contrasting graphs, derives their required behavior subset and compares
11/12 ordinary positions plus Output as a content experiment. These proposals do
not change runtime capacity or authorize executable starters. The current
six-module G1-P capacity carries no full-game authority.

R3-A's four systems pass in direction, with their selected behavior now provided
by [R3-S](../project/R3S_STARTER_SUBSTRATE.md) in isolated fixtures. R3-B must also
resolve **starter inventory fairness/convergence**: seven versus ten ordinary
owned modules must not make the opening choice a permanent progression/class
advantage. This is an open design gate; R3-S changes no inventory or capacity.

**D2-A — accepted for G1-P:** one small common studio kit: one chosen sound
source, tone or noise, plus Filter, LFO and Output. The choice is starting material,
not a character class, genre, difficulty or permanent branch. The other source
remains obtainable/auditionable very early. Do not restore Purist/Glitcher/Weaver
as startup classes. Characters, studios, mentors or manufacturers may later frame
projects without imposing classes; that framing remains future design.

**The starter kit teaches relationships, not a canonical signal chain.**

Source → Output demonstrates routing; Source → Filter → Output demonstrates
transformation; LFO → pitch/cutoff demonstrates modulation where that input exists.
Unplugging demonstrates real silence and the removal of a relationship. Noise →
Output, LFO → pitch, deliberate silence and ugly resonance are equally legitimate.
These are teaching examples, not a checklist of required successful topologies.
Noise has no pitch input in S1-A; its starter modulation example uses filter cutoff.

The first project has room to introduce VCA or Delay as a new relationship;
concrete offers and project content still need review. Do not provide the whole
S1-A palette as the initial owned kit merely because the sandbox already does.

### Projects introduce possibility — LOCKED DESIGN

**Projects introduce possibility; they do not confiscate the studio.**

**D3-A — accepted for G1-P:** projects may temporarily provide curated modules
for unrestricted audition. At project closure the player may retain a selected
offered module. No currency, rarity hierarchy or blind purchase is required for
G1-P. Other acquisition channels remain open for later design.

**D4-A — accepted with explicit structural progression:** closing a project
opens specific new opportunities/capabilities. Progression is not based on
musical quality, analyser scoring, amplitude, conventional topology or genre.
Minimal transparent interaction requirements may prove that the project was
engaged with, but player-chosen closure remains authoritative. Exact requirements
and the opportunity/capability map still need review; no hidden detector is implied.

**D5-B+A — accepted:** projects provide situated mechanical/material constraints
or questions; the sonic response is open. Constraints may concern available
tools, routing or actions, but must not prescribe what good music sounds like.
Free studio exploration remains available outside projects. Project constraints
do not authorize taking away the player's persistent studio or destroying patches.

### Rack space — LOCKED DESIGN

**D6-A+B — accepted for G1-P:** owned modules persist in generous studio storage.
The currently installed rack has finite working space, creating compositional
choices without destroying ownership. Projects may offer or foreground a limited
palette for their experiment; they do not remove access to the accumulated studio
or globally disable owned modules. Project constraints apply to the project
response, not to the player's entire studio.

No automatic eviction, forced selling, slot prices or destruction of modules.

**Rack space is a compositional constraint, not a progression currency.**

**Rack expansion as a progression driver — DEFERRED:** G1-P uses a fixed, modest
installed-space limit. Do not create a repeating +2-slots upgrade ladder. Later,
expansion may be an occasional structural unlock if playtesting shows additional
simultaneous relationships are interesting rather than merely convenient.
Growth primarily introduces new behavior, relationships and kinds of project.

Exact capacity is a prototype tuning choice, not a locked design number. Provide
room for the starter system, the auditioned module and potentially one additional
relationship; test whether the boundary is meaningful or merely annoying.
Existing 10/12/48-slot numbers carry no design authority. Selecting and testing
capacity belongs to the authorized G1-P slice, not a new upgrade economy.

### Projects preserve work — LOCKED DESIGN

**Projects may close doors; they do not erase the player's work.**

**D9-A — accepted for G1-P:** no destructive progression failure. A project may
be revised, abandoned, retried or returned to later. Failure to meet an explicit
project condition may leave that attempt incomplete; it never destroys owned
modules, saved patches, discoveries, archive items or the persistent studio.

Silence, noise, instability, feedback, low amplitude, unconventional routing and
an aesthetically unwanted result are never failure. Recovery must always be
explicit: revise, retry, abandon, or return to free studio exploration.

**D9-B — reserved for later optional situated events:** temporary stakes may
close an opportunity or lose a particular take, while the studio, instruments
and history remain safe. Examples include a project-only loan, a one-take live
performance, a machine that changes each attempt or an event that closes on
leaving. These are illustrative future content, not G1-P requirements.
**D9-C — incompatible:** destructive run loss/reset conflicts with the accepted
persistent-studio structure. Do not inherit half-wallet penalties, lives, boss
gates, curses or forced collection damage from the old shell.

**Hard consistency requirement for D7/D10:** returning temporary audition
modules must never silently break a preserved patch or archive item. The accepted
Studio/Project/Archive model below resolves preservation separately from ownership.

### Capture, saves and dependency preservation — LOCKED DESIGN

**D7 — B accepted as the long-term direction; A required in G1-P:** every closed
project stores a patch snapshot plus optional title/note. Optional audio may be
added later when recording is reliable. Recording is never required for project
closure. A snapshot preserves the system; it does not promise exact audio replay.

**D10-A — accepted:** a separate versioned new-studio save leaves the legacy save
untouched. Persist owned modules, current studio patch, active project state and
loans, structural progression/unlocks, and archived project snapshots. Loading
never autostarts audio.

| Layer | Meaning |
|---|---|
| Studio | What the player owns and freely uses; its current patch persists independently of a project. |
| Project | Its own temporary working branch, which may contain loans. |
| Archive | Immutable record of what the project actually became, including borrowed modules used in that project. |

**Archives preserve dependencies without granting ownership.**

An archived borrowed Delay remains part of that archived patch even when not
retained as owned. Archiving does not make it available for arbitrary future
studio patches. Project editing or a later fork must not mutate the original
archive. Exact branch initialization/merge UI and save serialization remain
implementation details to scope; do not silently overwrite the studio patch.

**A missing dependency is a state to explain, never a cable to silently delete.**

When an archived patch is reopened/forked and a dependency is not owned/available,
present that state and offer reacquire, substitute or retain-as-archive. Never
silently remove the module or its cables. The archive remains intact; concrete
reacquisition channels and substitution UX still need scoped design.

G1-P does not require perfect audio replay, legacy-save migration or long-term
DSP compatibility. Preserve an honest snapshot and explicit dependency state
without pretending a stored record grants unrestricted module availability.

These choices establish the starter kit, acquisition direction, structural
progression, project framing and non-destructive recovery alongside studio
persistence and closure, now including snapshot capture and separate versioned
saves. D1–D10 directions are accepted for their recorded scope in the
[G1-D packet](../plans/G1_D_DECISION_PACKET.md#6-acceptance-record--accepted-directions).
The user's subsequent G1-P working-slice order scoped concrete offers, engagement,
unlocks, provisional capacity and archive resolution; that slice is now implemented.
See [G1-P behavior and validation](../project/G1_P_STUDIO_SLICE.md). This does not
authorize expanding its two authored projects into a generalized content framework.

## Player verbs — LOCKED DESIGN

Ultimately support place module, remove module, patch cable, remove cable,
turn control, modulate control, listen, mute/isolate where useful, and capture/
record. Not every verb requires implementation in S1. The early experiment must
test patching itself rather than using a shop or numerical job result as a proxy.

## Signal grammar — LOCKED DESIGN

Distinguish at minimum **AUDIO**, **CV / MODULATION**, and **GATE / CLOCK**.
Connections should be musically meaningful. Electrical-engineering accuracy is
not required. Do not collapse every connection into a generic numerical bonus.

AUDIO should carry sound through transformations. CV should influence behavior
over time. GATE/CLOCK should articulate events or timing. The exact units, ranges,
mixed-family conversion rules and visualization are OPEN QUESTION; distinguish
them explicitly rather than pretending a generic colored cable has full semantics.

## Feedback — LOCKED DESIGN

Feedback is an intentional supported musical technique. The simulation may
become unstable, noisy, resonant, self-oscillating or rhythmically unpredictable.
Actual browser output must remain safety-limited. Safety limiting must not erase
the musical behavior. Feedback cannot be reduced to a score multiplier or a
decorative animation that leaves the actual signal path unchanged.

## No single correct patch — LOCKED DESIGN

There is no universally correct topology. A conventional chain may be useful,
but resemblance to textbook subtractive synthesis does not justify a global
generic score bonus.

### Topology examples — ILLUSTRATIVE

VCO → FILTER → VCA is one useful configuration, not inherently better than
VCO → EFFECT, noise → filter feedback, clock division networks, self-modulating
systems, drone patches or chaotic modulation. These are examples of valid
directions, not a required list of preset patches or S1 module requirements.

## Objectives — LOCKED DESIGN

Objectives should encourage exploration rather than genre conformity. The
objective system must not globally equate high amplitude, rarity, tonal harmony,
stable repetition or conventional routing with musical success. Its assessment
method and place in the loop are OPEN QUESTION.

### Objective examples — ILLUSTRATIVE

- Create a rhythm without a sequencer.
- Make the clock stop being the dominant pulse.
- Produce a stable tone, then destabilize it.
- Build a patch that changes without player input.
- Make noise breathe.
- Create something that almost repeats but never exactly does.
- Produce sound using feedback as a source.
- Make one module control several unrelated consequences.

These examples are not S0 implementation tasks, mandatory achievements, or
approved detection algorithms. A creative response must not be narrowed to a
hidden conventional chain merely to make automated scoring convenient.

## Progression — LOCKED DESIGN

Progression primarily expands possibility. New modules should add new topology,
modulation relationships, forms of instability, timing behavior, timbral
transformation and performance possibilities.

Avoid progression dominated by +10% damage, +20% score, rare item = objectively
better sound, or larger number wins. Constraints can frame discovery, but
progression must not primarily prevent listening or reward the same architecture
with incrementally larger values.

## Current RPG/incremental systems — OPEN QUESTION

All current systems remain in S0. The following classifications are design
assessments of current behavior, not final retention/removal decisions.

| System | Classification | Reason and decision still needed |
|---|---|---|
| Rarity | CONFLICTS WITH CORE LOOP | Current tiers mostly accompany higher value/cost and presence-based score rewards. A future rarity representing unusual behavior could fit; rarity cannot mean objectively better music. |
| AP | CONFLICTS WITH CORE LOOP | Currently gates jobs/scavenging; imposing this on listening/editing would interrupt discovery. Whether it belongs only to an optional outer narrative remains open. |
| Credits | NEUTRAL | Exchange currency alone does not dictate musical correctness. Acquisition could frame choices; price/value must not become the sound-quality hierarchy. |
| Reputation | NEEDS PLAYTEST | Currently earned from numerical jobs/knob grades and spent on boosts. Could represent discovered practice or opportunities, but existing reward incentives are not established as compatible. |
| Characters | POTENTIALLY COMPATIBLE | Different starter relationships can encourage different exploration; current class difficulty labels are not proof of behavioral diversity. Keep choices from policing genre. |
| Quests | POTENTIALLY COMPATIBLE | An objective format could invite exploration. Current repair/purify and knob-matching tasks are not that exploration; future evaluation remains open. |
| Shops | POTENTIALLY COMPATIBLE | Selecting a small palette can create meaningful constraints. Shopping must support discovery rather than replace patching as the interesting action. |
| Bosses | CONFLICTS WITH CORE LOOP | Current rounds reward target voltage and classify weak numerical output as failure, with no rival patch behavior. An optional encounter interpretation needs a separate design decision. |
| Trash | NEEDS PLAYTEST | Currently a nuisance type, score penalty weight and noise contributor; damaged/unpredictable behavior could be content. Calling noise trash must not make noise itself invalid. |
| Curses | CONFLICTS WITH CORE LOOP | Narrative treats unwanted instability as contamination; scalar sign bug also reverses its numerical effect. A behavior-based future constraint is open, not automatic removal. |
| Deck mechanics | CONFLICTS WITH CORE LOOP | Current random job hand and deck-as-sequencer sever persistent patch topology. A bounded owned-module palette could still fit; exact construction model is open. |
| Studio upgrades | NEEDS PLAYTEST | Rack capacity can expand relationships; compressor/cable boosts primarily increase gain/score. Future upgrades need consequences beyond larger numbers. |

The current performance minigame is also provisional: matching a target line
does influence some sound parameters, but frame-based stability is not evidence
of meaningful live musical performance. No deletion is decided here.

## Module philosophy — LOCKED DESIGN

Modules are defined primarily by behavior, not rarity/value score. Conceptual
roles include oscillator, noise source, filter/resonator, VCA/LPG, function
generator, LFO/chaos source, clock, divider/logic, sequencer, mixer, saturation/
waveshaping, delay, and utility/attenuator. These roles establish a vocabulary,
not a requirement to implement all of them in the first playable.

Real brands are not required. Avoid cloning commercial modules 1:1. A module
name or descriptive promise does not count as an implementation of its behavior.
Choose a small palette whose ports and controls have consequences that can be
heard, observed and learned.

## First playable — OPEN QUESTION

### S1 integration direction — LOCKED DESIGN

Reuse the working Studio audio engine and gradually make the visible patch
graph take authority over it. Preserve working synthesis/output capabilities
where they support the design; add routing and module behavior at explicit
seams rather than building a competing engine or treating decorative cables
as audio authority. S1-A establishes this boundary using Studio's shared context,
master safety, analyser and recording path. Its implemented slice is described
in [S1-A patch authority](../project/S1_A_PATCH_AUTHORITY.md).

The proposed S1 experiment asks **IS PATCHING ITSELF FUN?** It does not ask
whether the full progression system is complete. Exact module selection,
controls, signal ranges and implementation remain open and require follow-up
authorization.

### Candidate boundary — ILLUSTRATIVE

One screen, 5–8 module archetypes, actual patch cables, meaningful AUDIO/CV/GATE
distinction, direct manipulation, audible results, feedback possible, master
safety, and no economy required. This bounded candidate is developed in the
S1 proposal; it is not a mandate to implement the example set unchanged.

## Early-phase non-goals — LOCKED DESIGN

Do not build a VCV Rack clone, real-world voltage calibration simulator,
impedance model, commercial module database, giant modular marketplace,
multiplayer, DAW integration, MIDI implementation, plugin hosting, backend,
cloud save, AI composition, procedural 500-module catalogue, or complex economy
expansion. Reconsideration belongs to a later explicit design decision.

## Development priority — LOCKED DESIGN

**Audio fidelity is deferred; audio architecture is not.**

Crude DSP is sufficient while we establish the game. Visible cables must still
control real signal relationships, controls must affect their declared modules,
and runtime ownership, cleanup and bounded output must remain sound. Do not use
fake routing that requires rebuilding the game when audio improves. Reuse the
Studio engine and the S1-A seam throughout these stages.

The project sequence is:

1. **Game structure.** Decide the complete run: starting rack, acquisition,
   discovery, objectives, progression, module availability, studio growth,
   failure/non-failure, capture and completion. Decide what to keep, cut or
   transform from the RPG/incremental shell. G1-D is the next milestone: archaeology
   and a decision packet, with alternatives and recommendations. Review it with
   the user and record accepted decisions before G1-P implements a progression
   prototype. Worker recommendations do not lock the game structure.
2. **Rack/player experience.** Integrate the pixel rack, module movement, cables,
   inspector, controls, cellular background, save/load, responsive layout and
   onboarding. Modules need enough real behavior to make their roles understandable.
3. **Gameplay content.** Build interesting constraints and prompts: unusual
   starting systems, discoveries, unlocks, events, strange/damaged modules and
   performances or requests. These invite different approaches without genre
   judgment or score ladders; examples remain illustrative.
4. **End-to-end playable game.** Play from fresh save through progression to the
   late game and chosen end state with crude audio. Identify where the experience
   becomes boring, confusing or pointless before investing in fidelity.
5. **Serious audio pass.** Refine oscillator character, filters, FM,
   nonlinearities, audio-rate modulation, clock behavior, chaotic CV, delays,
   feedback, saturation, envelopes, aliasing, output safety, browser performance
   and recording quality. Basic safety and correct lifecycle remain requirements
   throughout; necessary gameplay behavior can arrive earlier.

These stages set priorities, not a prohibition on small supporting fixes.
Clock/GATE and S1-B are not the default next step. Add them when a specific piece
of gameplay requires their relationships. Define capture's role in G1 and provide
the minimum usable capture when the run needs it; advanced recording work can wait.

## Decisions remaining — OPEN QUESTION

- Which smallest palette produces multiple compelling behaviors, and which
  controls/connection conversions are useful without misleading the player?
- What experience makes exploratory objectives legible without reducing them
  to tonality, amplitude, or topology bonus checks?
- How should archive browsing, branch restoration and explicit dependency
  resolution make the accepted snapshot model useful and understandable?
- Which outer-loop systems survive playtesting, and how are existing saves
  handled if their meaning eventually changes?
- How should deliberate silence, unstable feedback and slowly evolving patches
  be communicated so safety indicators do not imply musical failure?
- What timing and lifecycle architecture remains responsive under sustained
  modulation/feedback on target browsers and modest hardware?

D1–D10 structural directions are accepted; scope concrete G1-P content and its
implementation task using those decisions. The overall studio ending remains
deferred. Use listening evidence
and an end-to-end prototype to refine the structure before expanding content or
audio fidelity. Catalogue promises and illustrative objectives are not requirements.
