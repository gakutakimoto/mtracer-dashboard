"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/bigquery")
      .then((res) => res.json())
      .then((data) => setData(data));
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
          {data.map((row: any, index: number) => (
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
