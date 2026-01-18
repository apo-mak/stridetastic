import { describe, expect, it } from 'vitest';
import {
  getLinkColor,
  getLinkCurvature,
  getLinkLabel,
  getLinkLineDash,
  getLinkWidth,
  getNodeColor,
  isBidirectionalConnection,
  isLinkInPath,
} from '@/lib/graphStyles';
import type { ForceGraphLink, ForceGraphNode, Node, Edge } from '@/types';
import { BRAND_PRIMARY, BRAND_PRIMARY_DARK } from '@/lib/brandColors';

const makeLink = (overrides: Partial<ForceGraphLink>): ForceGraphLink => ({
  source: overrides.source ?? 'A',
  target: overrides.target ?? 'B',
  rssi: overrides.rssi ?? -50,
  snr: overrides.snr ?? 5,
  hops: overrides.hops ?? 0,
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  color: overrides.color ?? '#999999',
  width: overrides.width ?? 2,
  value: overrides.value ?? 1,
  isMqtt: overrides.isMqtt,
  isMultiHopSegment: overrides.isMultiHopSegment,
  originalHops: overrides.originalHops,
  isLastHop: overrides.isLastHop,
  isMqttBrokerLink: overrides.isMqttBrokerLink,
  isDirectMultiHop: overrides.isDirectMultiHop,
});

const makeNode = (overrides: Partial<ForceGraphNode>): ForceGraphNode => ({
  id: overrides.id ?? 'A',
  name: overrides.name ?? 'Node A',
  node_num: overrides.node_num ?? 1,
  node_id: overrides.node_id ?? 'A',
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  color: overrides.color ?? '#123456',
  size: overrides.size ?? 10,
  isHidden: overrides.isHidden,
  isMqttBroker: overrides.isMqttBroker,
  isInterfaceNode: overrides.isInterfaceNode,
});

const makeRawNode = (overrides: Partial<Node>): Node => ({
  id: overrides.id ?? 1,
  node_num: overrides.node_num ?? 1,
  node_id: overrides.node_id ?? 'A',
  mac_address: overrides.mac_address ?? '00:11:22:33:44:55',
  is_licensed: overrides.is_licensed ?? false,
  is_low_entropy_public_key: overrides.is_low_entropy_public_key ?? false,
  has_private_key: overrides.has_private_key ?? false,
  is_virtual: overrides.is_virtual ?? false,
  first_seen: overrides.first_seen ?? '2026-01-13T11:00:00.000Z',
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  short_name: overrides.short_name,
  long_name: overrides.long_name,
  hw_model: overrides.hw_model,
  role: overrides.role,
  public_key: overrides.public_key,
  private_key_fingerprint: overrides.private_key_fingerprint,
});

const makeRawEdge = (overrides: Partial<Edge>): Edge => ({
  source_node_id: overrides.source_node_id ?? 1,
  target_node_id: overrides.target_node_id ?? 2,
  first_seen: overrides.first_seen ?? '2026-01-13T11:00:00.000Z',
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  last_packet_id: overrides.last_packet_id ?? 1,
  last_rx_rssi: overrides.last_rx_rssi ?? -50,
  last_rx_snr: overrides.last_rx_snr ?? 5,
  last_hops: overrides.last_hops ?? 0,
  edge_type: overrides.edge_type ?? 'PHYSICAL',
  interfaces_names: overrides.interfaces_names ?? [],
});

describe('graphStyles', () => {
  it('isBidirectionalConnection detects reverse links', () => {
    const links: ForceGraphLink[] = [
      makeLink({ source: 'A', target: 'B' }),
      makeLink({ source: 'B', target: 'A' }),
    ];
    expect(isBidirectionalConnection('A', 'B', links)).toBe(true);
    expect(isBidirectionalConnection('A', 'C', links)).toBe(false);
  });

  it('getLinkCurvature adds curvature for bidirectional links', () => {
    const links: ForceGraphLink[] = [
      makeLink({ source: 'A', target: 'B' }),
      makeLink({ source: 'B', target: 'A' }),
    ];
    expect(getLinkCurvature(links[0], links)).toBe(0.1);
    expect(getLinkCurvature(makeLink({ source: 'A', target: 'C' }), links)).toBe(0);
  });

  it('isLinkInPath respects direction', () => {
    const path = [['A', 'B', 'C']];
    expect(isLinkInPath(makeLink({ source: 'A', target: 'B' }), path)).toBe(true);
    expect(isLinkInPath(makeLink({ source: 'B', target: 'A' }), path)).toBe(false);
  });

  it('getNodeColor handles single selection mode', () => {
    const options = {
      selectedNodeId: 'A',
      secondSelectedNodeId: null,
      reachableNodes: new Set(['B']),
      reachableLinks: new Set<string>(),
      pathNodes: new Set<string>(),
      virtualEdgeSet: new Set<string>(),
      rawNodes: [],
      rawEdges: [],
    };

    expect(getNodeColor(makeNode({ id: 'A', color: '#111111' }), options)).toBe(BRAND_PRIMARY);
    expect(getNodeColor(makeNode({ id: 'B', color: '#abcdef' }), options)).toBe('#abcdef');
    expect(getNodeColor(makeNode({ id: 'C' }), options)).toBe('#d1d5db');
  });

  it('getNodeColor handles two-node selection mode and MQTT broker', () => {
    const options = {
      selectedNodeId: 'A',
      secondSelectedNodeId: 'B',
      reachableNodes: new Set<string>(),
      reachableLinks: new Set<string>(),
      pathNodes: new Set(['A', 'B']),
      virtualEdgeSet: new Set<string>(),
      rawNodes: [],
      rawEdges: [],
    };

    expect(getNodeColor(makeNode({ id: 'A', color: '#101010' }), options)).toBe(BRAND_PRIMARY_DARK);
    expect(getNodeColor(makeNode({ id: 'B', color: '#202020' }), options)).toBe('#10b981');
    expect(getNodeColor(makeNode({ id: 'X', isMqttBroker: true }), options)).toBe('#d1d5db');
  });

  it('getLinkColor highlights reachable links', () => {
    const options = {
      selectedNodeId: 'A',
      secondSelectedNodeId: null,
      reachableNodes: new Set<string>(),
      reachableLinks: new Set<string>(['A-B']),
      pathNodes: new Set<string>(),
      virtualEdgeSet: new Set<string>(),
      rawNodes: [],
      rawEdges: [],
    };

    const highlighted = getLinkColor(makeLink({ source: 'A', target: 'B', color: '#112233' }), options);
    const dimmed = getLinkColor(makeLink({ source: 'A', target: 'C', color: '#112233' }), options);

    expect(highlighted).toBe('#112233');
    expect(dimmed).toBe('#11223340');
  });

  it('getLinkWidth dims non-reachable and handles multihop segments', () => {
    const options = {
      selectedNodeId: 'A',
      secondSelectedNodeId: null,
      reachableNodes: new Set<string>(),
      reachableLinks: new Set<string>(['A-B']),
      pathNodes: new Set<string>(),
      virtualEdgeSet: new Set<string>(),
      rawNodes: [],
      rawEdges: [],
    };

    const multihop = getLinkWidth(makeLink({ isMultiHopSegment: true, isLastHop: false }), options);
    const reachable = getLinkWidth(makeLink({ source: 'A', target: 'B', width: 4 }), options);
    const dimmed = getLinkWidth(makeLink({ source: 'A', target: 'C', width: 4 }), options);

    expect(multihop).toBe(1);
    expect(reachable).toBe(6);
    expect(dimmed).toBe(2);
  });

  it('getLinkLabel builds labels for special links and virtual edges', () => {
    const rawNodes = [
      makeRawNode({ id: 1, node_id: 'A' }),
      makeRawNode({ id: 2, node_id: 'B' }),
    ];
    const rawEdges = [
      makeRawEdge({ source_node_id: 1, target_node_id: 2, edge_type: 'LOGICAL' }),
    ];
    const options = {
      selectedNodeId: null,
      secondSelectedNodeId: null,
      reachableNodes: new Set<string>(),
      reachableLinks: new Set<string>(),
      pathNodes: new Set<string>(),
      virtualEdgeSet: new Set<string>(['1-2']),
      rawNodes,
      rawEdges,
    };

    const label = getLinkLabel(makeLink({ source: 'A', target: 'B', rssi: -42, snr: 7 }), options);
    expect(label.startsWith('[ASSUMED]')).toBe(true);
    expect(label).toContain('Logical Link');

    const mqttLabel = getLinkLabel(
      makeLink({ source: 'A', target: 'mqtt_broker', isMqttBrokerLink: true }),
      options
    );
    expect(mqttLabel).toBe('');

    const apparent = getLinkLabel(makeLink({ source: 'A', target: 'B', isMqtt: true }), options);
    expect(apparent.startsWith('[ASSUMED] Aparent Link')).toBe(true);
  });

  it('getLinkLineDash handles mqtt, virtual, and multihop', () => {
    const virtualEdgeSet = new Set<string>(['nodeA-nodeB']);
    const graphNodes: ForceGraphNode[] = [
      makeNode({ id: 'A', node_id: 'nodeA' }),
      makeNode({ id: 'B', node_id: 'nodeB' }),
    ];

    const mqtt = getLinkLineDash(makeLink({ isMqttBrokerLink: true }), virtualEdgeSet, graphNodes);
    expect(mqtt).toEqual([2, 3]);

    const virtual = getLinkLineDash(makeLink({ source: 'A', target: 'B' }), virtualEdgeSet, graphNodes);
    expect(virtual).toEqual([8, 4]);

    const multihop = getLinkLineDash(makeLink({ isMultiHopSegment: true }), new Set<string>(), graphNodes);
    expect(multihop).toEqual([5, 5]);

    const normal = getLinkLineDash(makeLink({ source: 'A', target: 'B' }), new Set<string>(), graphNodes);
    expect(normal).toBeNull();
  });
});
