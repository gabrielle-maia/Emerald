// app/(tabs)/orders.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrdersStore } from '../../src/store/useStore';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../src/theme';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../src/utils';
import { Order } from '../../src/types';

function OrderCard({ order }: { order: Order }) {
  const statusColor = getOrderStatusColor(order.status);
  const statusLabel = getOrderStatusLabel(order.status);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsPreview}>
        {order.items.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} mais itens</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
      </View>

      {order.trackingCode && (
        <View style={styles.trackingRow}>
          <Ionicons name="navigate-outline" size={14} color={Colors.emerald} />
          <Text style={styles.trackingText}>Rastreio: {order.trackingCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { orders } = useOrdersStore();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
      </View>

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Nenhum pedido ainda"
          description="Seus pedidos aparecerão aqui após a primeira compra"
          actionLabel="Fazer primeira compra"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OrderCard order={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, letterSpacing: -1 },
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    ...Shadow.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  orderDate: { color: Colors.gray500, fontSize: FontSize.xs, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: Spacing.sm },
  itemsPreview: { gap: 4, marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { color: Colors.gray300, fontSize: FontSize.sm, flex: 1 },
  itemQty: { color: Colors.gray500, fontSize: FontSize.sm, marginLeft: 8 },
  moreItems: { color: Colors.gray500, fontSize: FontSize.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: Colors.gray400, fontSize: FontSize.sm },
  totalValue: { color: Colors.emerald, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
  },
  trackingText: { color: Colors.emerald, fontSize: FontSize.xs },
});
