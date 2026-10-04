# Known quirks and validation

Baseline: `96b1008`. S0 records these issues; it fixes none of them.
Source-confirmed means code establishes the stated mechanism. Browser candidates
identify consequences or broader behavior not verified during the limited smoke.

## Confirmed source issues

| Finding | Evidence / consequence |
|---|---|
| Two App files, one active | `index.tsx` imports root `./App`; no active import of `src/App.tsx`. Alternate file differs substantially (147 insertions/243 deletions in file comparison) and has unresolved local import paths. It is not safe to call it an identical duplicate. Preserve it in S0. |
| Missing stylesheet | `index.html` references `/index.css`, which does not exist; production build warns. Styling currently depends on CDN script/inline CSS. |
| Duplicate entry tags | `index.html` contains both `./index.tsx` and `/index.tsx`. Source redundancy does not by itself prove two React mounts: browsers can deduplicate the same module URL. Duplicate development logs are observed with StrictMode. |
| No automated test/lint script | `package.json` has dev/build/preview only; Vite build does not prove TypeScript correctness or unused-file correctness. Empty `bun.lock` supplies no dependency resolution lock. |
| Stale API scaffolding | `vite.config.ts:loadEnv/define` substitutes GEMINI_API_KEY into two process.env expressions. No gameplay code uses them, no AI client dependency or API request exists. HTML retains AI Studio import map. README correctly says no API key is needed. |
| Cables do not route audio | `audioEngine.playPatch` ignores modules/cables; `syncLivingRack` receives deck only. Job's master scope measures ongoing rack audio. |
| Signal family collapsed in score | `calculatePatchSynergy` distinguishes only destination AUDIO versus CV-or-GATE; ignores sourcePortIndex semantics. Job pointer handlers do not type-check cable families. |
| Unconnected modules and bonuses | VCO/LFO/utility sources can score without output path. Presence alone awards architecture bonuses. Each cable adds score even if it contributes little usable topology. |
| Curse sign inversion | CURSE output is negative, score weight is -2; product adds positive score. The narrative of harmful curse is not enforced by this score calculation. |
| Score breakdown misleading | Returned baseScore equals finalScore after bonuses and multiplier; UI then separately lists cable/synergy amounts. `isSilence` describes low score, not actual silence. |
| Cycle behavior only simulated | Job blocks self-patching but permits cycles between different modules and duplicate cables. Four scalar iterations, not delay time/sample feedback, determine score. Repeated scalar amplification has no corresponding audible loop. |
| Advertised module DSP absent | Catalogue names such as FM, reverb, bitcrusher, ADSR, logic, divider, mixer and noise are not implemented as dedicated patch behaviors. Row/type dispatch can turn a FILTER into a click or a VCA into a bass-row glitch. |
| Dead calibration controls | FILTER cutoff/resonance, LFO rate, VCA level, EFFECT time/mix, SEQ probability are stored but read by neither scoring nor sound. VCO tuning/fine apply only to pitched rows; ducker depth is global. |
| Silent delay topology | Delay/send/filter/feedback nodes exist, but send stays zero and receives no source. delaySendAmt is unused. Rack DELAY FEEDBACK/space override modify feedback of an unfed network. |
| Misleading pitch unit | Coarse tuning shifts scale-array index, not semitone frequency directly. Pitched Solar Sine defaults to triangle; name-based Saw/Pulse checks are the only waveform specializations. |
| Rack controls mismatch | Insert Blank Panel tooltip says 5cr; root handleAddBlank only logs. Deprecated move handler is empty. Settings master volume is a fixed 50% display. Rack has jacks but no cable handlers. |
| Static rack versus active cap | 48 visible/sequence slots coexist with initial capacity 10 and max upgraded capacity 20. Boss bloat can bypass capacity; overlong saves retain modules beyond sequenced rows. |
| Save triggers incomplete | Save effect omits AP, reputation, upgrades, rackCapacity, quests and character-only changes from dependency list. Full object writes occur only on listed changes and when guard permits. See STATE_MODEL for exact conditions. |
| Hydration mismatch | Initializer sets legacy tutorialStep default; second load effect can replace state without it. JSON is trusted; missing deck/quests or duplicate IDs have no migration/validation. |
| Identity assumptions | Instances use unchecked nine-character random strings. Static template IDs repeat in SCRAP_POOL weighting, but acquisitions normally regenerate instance IDs. Collisions/imported duplicate IDs can merge score nodes and make ID-based update/mute/sell ambiguous. No collision was observed in smoke. |
| Shop refresh differs from day UI | Shop generates on initial empty in-memory stock; ordinary day effect does not replace nonempty inventory. Actual guaranteed refresh is on nonfinal boss win or reload. |
| Boss content mostly decorative | Boss deckPool never participates in round scoring or audio. Every boss round uses week 1 threshold and cable level 0; hp changes required successes. |
| Boss failed-round retry missing | Failure decrements lives but does not change round key/reset JobView. Job remains patched; repeated failures needed for defeat are not normally available through that completed round. Full recovery route requires browser testing. |
| Performance time tied to render activity | Stability adjusts each frame, not delta-scaled; countdown effect depends on stability and restarts its interval as stability changes. Nominal 20 s can stall. Target-change accumulator also resets when its effect restarts on knob/target updates. |
| Uncancelled activity callbacks | Job analysis/completion timeouts and delayed boss transition/outcome callbacks have no cleanup; navigation can leave callbacks changing another view later. POWER ON is not guarded by analyzing in its handler. |
| Audio startup before gesture | Root sync effect/oscilloscope can create context during mount, with unawaited resume calls; first-click listener retries. Browser smoke logged autoplay warnings but did reach running. |
| Singleton lifecycle | Scheduler timeout, modulation animation and looping noise have no exported stop/dispose. Component cleanup removes scope animation/step subscription but not engine activity. First-click listener effect has no return cleanup, relevant under StrictMode. |
| Mute is trigger-based | Module mute suppresses future voices/ducker contributions, not ongoing tails or trash-count noise. All module types may display playhead activity even if no voice is implemented for the row. |
| Recorder UI lifetime differs from engine | Rack isRecording is local; engine recorder persists across unmount. Unsupported MediaRecorder returns false silently; no error recovery on stop; download link remains appended. |
| Init and controls can disagree | Engine bus gains initially use volDrum/volBass/volMelody without rackVolume; syncLivingRack calls setGlobalRackParams({}), which updates no gain. UI shows rackVolume 0.5 until a control update applies the merged params. MasterBoost stored before context creation is not used in its initial 0.5 gain. |

## Browser-test candidates

- Human listening across SEQ/DRONE/NOISE; saturation behavior, loudness and timbral diversity.
- Long-running/background/suspended-context scheduler catch-up, overlapping note tails,
  page reset, hot reload and StrictMode listener behavior.
- Module moves into bass/texture, tuning range, per-module/bus/master mute, and controls
  whose effect is absent or narrower than the label implies.
- Recording start/stop/download, WebM codec portability, leaving/reopening rack while recording.
- Full boss chain, failed-round retry, abandoning jobs/bosses, repeated POWER ON or sleep,
  late callbacks and New Game+ behavior.
- Performance countdown completion, frame-rate dependence and target changes under knob motion.
- Partial tutorial reload; AP-only/upgrade-only persistence; legacy, malformed, duplicate-ID,
  and >48-entry saves; storage-denied/quota failures.
- Mobile/touch, narrow viewport, cable geometry and port highlighting: JobView uses hard-coded
  coordinates and passes highlight index -1 while ModuleCard requires exact index equality.
- Audio safety under a future *real* feedback patch: the current game does not exercise it.

## S0 validation

Executed on 2026-10-04 with application source unchanged.

| Check | Result and limit |
|---|---|
| Dependencies | Ran `npm install --package-lock=false --no-audit --no-fund`: up to date. Preserved empty bun.lock; no source/schema/lockfile changes. |
| `npm run build` | PASS, Vite 6.4.3, 1700 transformed modules; existing `/index.css` warning. |
| Server identification | Detected port 3000 was another app (The Analyst); no gameplay action succeeded there. Started this repository's Vite at `http://127.0.0.1:3001` with strictPort for isolation. |
| Open game | PASS, headless Chromium, title Eurorack Incremental, story and character screen. |
| Audio user gesture | PASS for context activation and signal: suspended before interaction, running after story/character/tutorial clicks; ten master peak samples approximately 0.034–0.329. No physical listening assertion. |
| Rack entry | PASS after four Purist starter scavenges; Main Rack appeared. Reorder and all control combinations not tested. |
| Cable exercise | PASS, dragged AUDIO_OUT to AUDIO_IN in a job; UI reported one connection. This verifies interaction, not audible graph control. |
| Job completion | PASS in that random hand: 87 credits reward, HOME credits 137. This is an observed run, not a fixed balance requirement. |
| Save reload | PASS for smoke-created current-schema save: Purist, tutorialStep 5, deck length 48; reload reported Save game loaded and allowed job entry. No access to the user's personal browser save. |
| Page errors/warnings | No uncaught page errors in completed smoke. Autoplay resume warnings and Tailwind production-CDN warning observed. Duplicate new-session/load logs observed. |

Playwright used a temporary script and fresh browser context, not a personal
profile. Its AudioContext constructor wrapper only retained created context
references for inspection; analyser samples used the existing service export.
No app source or gameplay logic was modified. Temporary test artifacts and
generated dist/node_modules are not project documentation deliverables.
