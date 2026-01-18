import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  getLinkDistance,
  getLinkWidth,
  getNodeActivityColor,
  getLinkActivityColor,
  transformNetworkData,
} from '@/lib/networkTransforms';
import type { Node, Edge } from '@/types';

const makeNode = (overrides: Partial<Node>): Node => ({
  id: overrides.id ?? 1,
  node_num: overrides.node_num ?? 100,
  node_id: overrides.node_id ?? 'node-1',
  mac_address: overrides.mac_address ?? '00:11:22:33:44:55',
  short_name: overrides.short_name,
  long_name: overrides.long_name,
  hw_model: overrides.hw_model,
  is_licensed: overrides.is_licensed ?? false,
  role: overrides.role,
  public_key: overrides.public_key,
  is_low_entropy_public_key: overrides.is_low_entropy_public_key ?? false,
  has_private_key: overrides.has_private_key ?? false,
  private_key_fingerprint: overrides.private_key_fingerprint,
  is_unmessagable: overrides.is_unmessagable,
  is_virtual: overrides.is_virtual ?? false,
  latitude: overrides.latitude,
  longitude: overrides.longitude,
  altitude: overrides.altitude,
  position_accuracy: overrides.position_accuracy,
  location_source: overrides.location_source,
  battery_level: overrides.battery_level,
  voltage: overrides.voltage,
  channel_utilization: overrides.channel_utilization,
  air_util_tx: overrides.air_util_tx,
  uptime_seconds: overrides.uptime_seconds,
  temperature: overrides.temperature,
  relative_humidity: overrides.relative_humidity,
  barometric_pressure: overrides.barometric_pressure,
  gas_resistance: overrides.gas_resistance,
  iaq: overrides.iaq,
  latency_reachable: overrides.latency_reachable,
  latency_ms: overrides.latency_ms,
  first_seen: overrides.first_seen ?? '2026-01-13T11:00:00.000Z',
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  interfaces: overrides.interfaces,
});

const makeEdge = (overrides: Partial<Edge>): Edge => ({
  source_node_id: overrides.source_node_id ?? 1,
  target_node_id: overrides.target_node_id ?? 2,
  first_seen: overrides.first_seen ?? '2026-01-13T11:00:00.000Z',
  last_seen: overrides.last_seen ?? '2026-01-13T11:59:00.000Z',
  last_packet_id: overrides.last_packet_id ?? 1,
  last_rx_rssi: overrides.last_rx_rssi ?? -60,
  last_rx_snr: overrides.last_rx_snr ?? 5,
  last_hops: overrides.last_hops ?? 0,
  edge_type: overrides.edge_type ?? 'PHYSICAL',
  interfaces_names: overrides.interfaces_names ?? [],
});

describe('networkTransforms', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getNodeActivityColor uses time buckets', () => {
    expect(getNodeActivityColor('2026-01-13T11:56:00.000Z')).toBe('#22c55e');
    expect(getNodeActivityColor('2026-01-13T11:30:00.000Z')).toBe('#84cc16');
    expect(getNodeActivityColor('2026-01-13T10:30:00.000Z')).toBe('#eab308');
    expect(getNodeActivityColor('2026-01-12T14:00:00.000Z')).toBe('#f97316');
    expect(getNodeActivityColor('2026-01-12T11:00:00.000Z')).toBe('#ef4444');
  });

  it('getLinkActivityColor mirrors activity buckets', () => {
    expect(getLinkActivityColor('2026-01-13T11:56:00.000Z')).toBe('#22c55e');
    expect(getLinkActivityColor('2026-01-13T11:30:00.000Z')).toBe('#84cc16');
  });

  it('getLinkDistance returns MQTT and SNR distances', () => {
    const mqtt = makeEdge({ last_rx_rssi: 0, last_rx_snr: 0 });
    expect(getLinkDistance(mqtt)).toBe(200);

    expect(getLinkDistance(makeEdge({ last_rx_snr: 10 }))).toBe(60);
    expect(getLinkDistance(makeEdge({ last_rx_snr: 5 }))).toBe(80);
    expect(getLinkDistance(makeEdge({ last_rx_snr: 0 }))).toBe(100);
    expect(getLinkDistance(makeEdge({ last_rx_snr: -5 }))).toBe(120);
    expect(getLinkDistance(makeEdge({ last_rx_snr: -6 }))).toBe(140);
  });

  it('getLinkWidth returns MQTT and SNR widths', () => {
    const mqtt = makeEdge({ last_rx_rssi: 0, last_rx_snr: 0 });
    expect(getLinkWidth(mqtt)).toBe(1);

    expect(getLinkWidth(makeEdge({ last_rx_snr: 10 }))).toBe(5);
    expect(getLinkWidth(makeEdge({ last_rx_snr: 5 }))).toBe(4);
    expect(getLinkWidth(makeEdge({ last_rx_snr: 0 }))).toBe(3);
    expect(getLinkWidth(makeEdge({ last_rx_snr: -5 }))).toBe(2);
    expect(getLinkWidth(makeEdge({ last_rx_snr: -6 }))).toBe(1);
  });

  it('transformNetworkData adds MQTT broker links for self-directed edges', () => {
    const nodes = [
      makeNode({ id: 1, node_id: 'node-1', last_seen: '2026-01-13T11:59:00.000Z' }),
      makeNode({ id: 2, node_id: 'node-2', last_seen: '2026-01-13T11:50:00.000Z' }),
    ];
    const edges = [
      makeEdge({ source_node_id: 1, target_node_id: 1, last_rx_rssi: -10, last_rx_snr: 10 }),
      makeEdge({ source_node_id: 1, target_node_id: 2, last_rx_rssi: -60, last_rx_snr: 5 }),
    ];

    const result = transformNetworkData('graph', nodes, edges, false, true, false, false, 'all', 'all');

    const mqttNode = result.nodes.find((node) => node.id === 'mqtt_broker');
    expect(mqttNode).toBeTruthy();

    const mqttLinks = result.links.filter((link) => link.isMqttBrokerLink);
    expect(mqttLinks).toHaveLength(2);
    expect(mqttLinks.some((link) => link.source === 'node-1')).toBe(true);
    expect(mqttLinks.some((link) => link.target === 'node-1')).toBe(true);

    const directLinks = result.links.filter((link) => !link.isMqttBrokerLink);
    expect(directLinks).toHaveLength(1);
  });

  it('transformNetworkData segments multi-hop links', () => {
    const nodes = [
      makeNode({ id: 1, node_id: 'node-1' }),
      makeNode({ id: 2, node_id: 'node-2' }),
    ];
    const edges = [
      makeEdge({ source_node_id: 1, target_node_id: 2, last_hops: 2 }),
    ];

    const result = transformNetworkData('graph', nodes, edges, false, false, false, false, 'all', 'all');

    const hiddenNodes = result.nodes.filter((node) => node.isHidden);
    expect(hiddenNodes).toHaveLength(2);

    const segments = result.links.filter((link) => link.isMultiHopSegment);
    expect(segments).toHaveLength(3);
    expect(result.links.some((link) => link.isDirectMultiHop)).toBe(false);
  });

  it('transformNetworkData can exclude multi-hop links', () => {
    const nodes = [
      makeNode({ id: 1, node_id: 'node-1' }),
      makeNode({ id: 2, node_id: 'node-2' }),
    ];
    const edges = [
      makeEdge({ source_node_id: 1, target_node_id: 2, last_hops: 1 }),
    ];

    const result = transformNetworkData('graph', nodes, edges, false, false, false, true, 'all', 'all');
    expect(result.links).toHaveLength(0);
  });
});
