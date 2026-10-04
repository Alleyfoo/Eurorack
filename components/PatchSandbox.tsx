import React, { useState } from 'react';
import PatchWorkspace from './PatchWorkspace';
import { createInitialPatch } from '../services/patchModel.ts';

export default function PatchSandbox() {
    const [patch, setPatch] = useState(createInitialPatch);
    return <PatchWorkspace patch={patch} setPatch={setPatch} />;
}
