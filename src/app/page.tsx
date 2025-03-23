"use client";
import { useEffect, useState } from "react";

// SwingData型を定義します（必要に応じて調整）
interface SwingData {
  profileHeight: number;
  impactHeadSpeed: number;
  cluster: number;
  // 他にも必要なフィールドがあれば追加してください
}

export default function Home() {
  const [data, setData] = useState<SwingData[]>([]); // SwingData型の配列に変更

  useEffect(() => {
    fetch("/api/bigquery")
      .then((res) => res.json())
      .then((data: SwingData[]) => setData(data)); // 受け取るデータの型を明確に定義
  }, []);

  return (
    <div>
      <h1>スイングデータ</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Profile Height</th>
            <th>Impact Head Speed</th>
            <th>Cluster</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.profileHeight}</td>
              <td>{row.impactHeadSpeed.toFixed(2)}</td>
              <td>{row.cluster}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
