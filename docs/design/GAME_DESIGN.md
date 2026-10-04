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
- How should capture support discovery: audio only, patch snapshot, performance
  replay, or a later library? S0 commits to none of those storage designs.
- Which outer-loop systems survive playtesting, and how are existing saves
  handled if their meaning eventually changes?
- How should deliberate silence, unstable feedback and slowly evolving patches
  be communicated so safety indicators do not imply musical failure?
- What timing and lifecycle architecture remains responsive under sustained
  modulation/feedback on target browsers and modest hardware?

Present the full-run and system-retention questions in G1-D for joint review;
even the choice between finite runs and a persistent studio is open. Implement
G1-P only after user acceptance. Use listening evidence
and an end-to-end prototype to refine the structure before expanding content or
audio fidelity. Catalogue promises and illustrative objectives are not requirements.
