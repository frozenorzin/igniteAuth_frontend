import { SimulationService } from './simulation.service';
import { ControlPlaneRequest, ControlPlaneResponse } from './control-plane.service';

describe('SimulationService', () => {
  const service = new SimulationService();
  const request: ControlPlaneRequest = { referenceSystemId: 1, subSystemId: 'GPIO', subSystem: 'GPIO', intent: 'IntentHash1', command: 'ReadPinState' };
  const response: ControlPlaneResponse = { cpcId: 42, subSystem: 'GPIO', intent: 'IntentHash1', command: 'ReadPinState', decision: 'Allow', reasonCode: 'ALLOW_VALIDATED', message: '', timeStamp: '' };
  it('returns reproducible fixtures only after an explicit matching allow', () => {
    expect(service.run(request, response)?.[0]).toContain('[SIMULATED]');
    expect(service.run(request, response)).toEqual(service.run(request, response));
  });
  it('does not simulate on deny, malformed decisions, or mismatched responses', () => {
    expect(service.run(request, { ...response, decision: 'Deny' })).toBeNull();
    expect(service.run(request, { ...response, decision: 'allow' })).toBeNull();
    expect(service.run(request, { ...response, command: 'SetPinState' })).toBeNull();
    expect(service.run(request, { ...response, cpcId: 0 })).toBeNull();
  });
});
