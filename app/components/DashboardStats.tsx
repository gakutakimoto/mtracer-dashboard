"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/stat";

export default function DashboardStats() {
  return (
    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
      <StatCard label="合計スイング数" value="100" />
      <StatCard label="平均ヘッドスピード" value="43.2 m/s" />
      <StatCard label="平均キャリー" value="145.3 yd" />
      <StatCard label="成功率" value="86%" />
    </SimpleGrid>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Stat bg="gray.700" color="white" borderRadius="md" p={4}>
      <StatLabel>{label}</StatLabel>
      <StatNumber fontSize="2xl">{value}</StatNumber>
      <StatHelpText>過去30スイング</StatHelpText>
    </Stat>
  );
}
