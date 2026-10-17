import { Injectable } from '@angular/core';
import { ControlPlaneRequest, ControlPlaneResponse } from './control-plane.service';

const fixtures: Readonly<Record<string, readonly string[]>> = {
  'GPIO:ReadPinState': ['Pin: PA5', 'Result: HIGH / ACTIVE', 'Status: Pin currently in use'],
  'GPIO:SetPinState': ['Pin: PA5', 'Result: HIGH', 'Status: Simulated state change'],
  'ADC:ReadADCChannel': ['Channel: ADC1_IN0', 'Reading: 1.65 V (2048 / 4095)'],
  'Memory:ReadMemoryRegion': ['Region: demo buffer', 'Data: 49 47 4E 49 54 45'],
  'FirmwareManager:GetFirmwareVersion': ['Version: 1.0.0-sim'],
  'FirmwareManager:RequestFirmwareUpdate': ['Update: simulation accepted', 'No device firmware was modified'],
  'SystemMonitor:ReadSystemHealth': ['Status: nominal', 'Temperature: 32 °C', 'Uptime: 01:23:45']
};

@Injectable({ providedIn: 'root' })
export class SimulationService {
  run(request: ControlPlaneRequest, response: ControlPlaneResponse): readonly string[] | null {
    // Never simulate on an ambiguous, mismatched, or denied backend response.
    if (response.decision !== 'Allow' || !Number.isSafeInteger(response.cpcId) || response.cpcId <= 0 ||
        response.subSystem !== request.subSystem || response.intent !== request.intent ||
        response.command !== request.command) return null;
    const fixture = fixtures[`${request.subSystem}:${request.command}`];
    return fixture ? [`[SIMULATED] ${request.command} executed on STM32 reference model.`, ...fixture] : null;
  }
}
