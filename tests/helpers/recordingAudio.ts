/** Records Web Audio operations without claiming to simulate DSP. */
export class RecordingParam {
    value = 0;
    targets: { value: number; time: number; constant: number }[] = [];
    setTargetAtTime(value: number, time: number, constant: number) {
        this.value = value; this.targets.push({ value, time, constant });
    }
}
export class RecordingNode {
    kind: string;
    connections: (RecordingNode | RecordingParam)[] = [];
    disconnects = 0;
    starts = 0;
    stops = 0;
    gain = new RecordingParam();
    frequency = new RecordingParam();
    detune = new RecordingParam();
    Q = new RecordingParam();
    delayTime = new RecordingParam();
    type = '';
    loop = false;
    curve: Float32Array | null = null;
    oversample = '';
    buffer: unknown = null;
    maxDelay?: number;
    constructor(kind: string) { this.kind = kind; }
    connect(target: RecordingNode | RecordingParam) { this.connections.push(target); }
    disconnect(target?: RecordingNode | RecordingParam) {
        this.disconnects++;
        this.connections = target ? this.connections.filter(c => c !== target) : [];
    }
    start() { this.starts++; }
    stop() { this.stops++; }
}
export class RecordingContext {
    nodes: RecordingNode[] = [];
    sampleRate = 32;
    currentTime = 12;
    state = 'suspended';
    resumes = 0;
    buffers: { channels: number; length: number; sampleRate: number; data: Float32Array }[] = [];
    node(kind: string) { const node = new RecordingNode(kind); this.nodes.push(node); return node; }
    createGain() { return this.node('gain'); }
    createBiquadFilter() { return this.node('filter'); }
    createOscillator() { return this.node('oscillator'); }
    createBufferSource() { return this.node('buffer-source'); }
    createWaveShaper() { return this.node('shaper'); }
    createDelay(maxDelay: number) { const node = this.node('delay'); node.maxDelay = maxDelay; return node; }
    createBuffer(channels: number, length: number, sampleRate: number) {
        const buffer = { channels, length, sampleRate, data: new Float32Array(length) };
        this.buffers.push(buffer); return { getChannelData: () => buffer.data };
    }
    async resume() { this.resumes++; this.state = 'running'; }
}
