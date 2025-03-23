"use client";
import { useState, useEffect, useMemo } from "react";

/* ===============================
   型定義: SwingData
   =============================== */
interface SwingData {
  profileHeight: number;
  impactHeadSpeed: number;
  estimateCarry: number;
  cluster: number;
  impactAttackAngle?: number;
  swing_type?: string;
  club_type?: string;
  impactFaceAngle?: number;  // 追加：インパクト時のフェース角
  impactClubPath?: number;   // 追加：インパクト時のクラブパス
  success?: boolean; // 追加：成功スイングかどうか
  height_category?: number; // 追加：身長カテゴリ (0: 170cm以上, 1: 170cm以下)
}

/* ===============================
   カスタムフック: useSwingData
   =============================== */
const useSwingData = () => {
  const [data, setData] = useState<SwingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/bigquery");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const rawData = await res.json();

        // 取得データに不足している項目をランダム補完（サンプル用）
        const enhancedData = rawData.map((item: any) => ({
          ...item,
          impactAttackAngle: item.impactAttackAngle ?? (Math.random() * 10 - 5),
          swing_type:
            item.swing_type ??
            ["Inside-out Draw Hitter", "Straight Power Hitter", "Straight Athlete", "Outside-in Control", "Inside-out Fade", "Rotation Specialized"][
              Math.floor(Math.random() * 6)
            ],
          club_type:
            item.club_type ??
            ["Driver", "Iron", "Wedge", "Putter"][
              Math.floor(Math.random() * 4)
            ],
          success: Math.random() < 0.5 ? true : false, // success フィールドを追加
          height_category: item.profileHeight >= 170 ? 0 : 1, // height_categoryを設定
        }));
        setData(enhancedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

/* ===============================
   メインコンポーネント: Home
   =============================== */
export default function Home() {
  const { data, loading, error } = useSwingData();
  const [selectedSwingType, setSelectedSwingType] = useState<string>("");
  const [selectedClubType, setSelectedClubType] = useState<string>("");
  const [selectedSuccess, setSelectedSuccess] = useState<string>(""); // success 用の state
  const [selectedHeightCategory, setSelectedHeightCategory] = useState<string>(""); // height_category 用の state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15; // 1ページに表示するアイテム数

  // SWING TYPE, CLUB TYPE, SUCCESS, HEIGHT CATEGORY でフィルタリング
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSwingType = selectedSwingType ? item.swing_type === selectedSwingType : true;
      const matchClubType = selectedClubType ? item.club_type === selectedClubType : true;
      const matchSuccess = selectedSuccess ? item.success.toString() === selectedSuccess : true; // success フィルタリング
      const matchHeightCategory = selectedHeightCategory ? item.height_category.toString() === selectedHeightCategory : true; // height_category フィルタリング
      return matchSwingType && matchClubType && matchSuccess && matchHeightCategory;
    });
  }, [data, selectedSwingType, selectedClubType, selectedSuccess, selectedHeightCategory]);

  // データのページネーション（1ページに15行）
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // IMPACT FACE ANGLE, HEAD SPEED, GripSpeed, EstimateCarry, impactClubPathの中央値データを作成
  const medianData = useMemo(() => {
    const calculateMedian = (values: number[]) => {
      values.sort((a, b) => a - b);
      const middle = Math.floor(values.length / 2);
      return values.length % 2 === 0
        ? (values[middle - 1] + values[middle]) / 2
        : values[middle];
    };

    return {
      impactFaceAngle: calculateMedian(filteredData.map(item => item.impactFaceAngle ?? 0)),
      headSpeed: calculateMedian(filteredData.map(item => item.impactHeadSpeed ?? 0)),
      gripSpeed: calculateMedian(filteredData.map(item => item.impactGripSpeed ?? 0)),
      estimateCarry: calculateMedian(filteredData.map(item => item.estimateCarry ?? 0)),
      impactClubPath: calculateMedian(filteredData.map(item => item.impactClubPath ?? 0)), // 追加
    };
  }, [filteredData]);

  // データが無い場合の表示
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  // ページネーションのための次のページと前のページを管理
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div style={{ padding: "20px" }}>
      <h1>M-Tracerゴルフスイング データダッシュボード</h1>

      {/* プルダウンメニューを横に並べる */}
      <div className="select-container">
        {/* SWING TYPEのプルダウンメニュー */}
        <select
          value={selectedSwingType}
          onChange={(e) => setSelectedSwingType(e.target.value)}
        >
          <option value="">すべてのスイングタイプ</option>
          <option value="Inside-out Draw Hitter">Inside-out Draw Hitter</option>
          <option value="Straight Power Hitter">Straight Power Hitter</option>
          <option value="Straight Athlete">Straight Athlete</option>
          <option value="Outside-in Control">Outside-in Control</option>
          <option value="Inside-out Fade">Inside-out Fade</option>
          <option value="Rotation Specialized">Rotation Specialized</option>
        </select>

        {/* CLUB TYPEのプルダウンメニュー */}
        <select
          value={selectedClubType}
          onChange={(e) => setSelectedClubType(e.target.value)}
        >
          <option value="">すべてのクラブタイプ</option>
          <option value="D">ドライバー</option>
          <option value="I">アイアン</option>
        </select>

        {/* SUCCESSのプルダウンメニュー */}
        <select
          value={selectedSuccess}
          onChange={(e) => setSelectedSuccess(e.target.value)}
        >
          <option value="">スイング成功モデル</option>
          <option value="true">成功スイング</option>
          <option value="false">通常スイング</option>
        </select>

        {/* HEIGHT CATEGORYのプルダウンメニュー */}
        <select
          value={selectedHeightCategory}
          onChange={(e) => setSelectedHeightCategory(e.target.value)}
        >
          <option value="">すべての身長カテゴリー</option>
          <option value="0">170cm以上</option>
          <option value="1">170cm以下</option>
        </select>
      </div>

      {/* 各特性の中央値 */}
      <div style={{ marginBottom: "20px" }}>
        <h3>各特性の中央値</h3>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Impact Face Angle (°)</th>
              <th>Head Speed (m/s)</th>
              <th>Grip Speed (m/s)</th>
              <th>Estimate Carry (yard)</th>
              <th>Impact Club Path</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{medianData.impactFaceAngle.toFixed(2)} °</td>
              <td>{medianData.headSpeed.toFixed(2)} m/s</td>
              <td>{medianData.gripSpeed.toFixed(2)} m/s</td>
              <td>{medianData.estimateCarry.toFixed(2)} yard</td>
              <td>{medianData.impactClubPath.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* スイングごとの指標データ */}
      <table border="1" style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>CLUB TYPE</th>
            <th>PROFILE HEIGHT</th>
            <th>HEAD SPEED</th>
            <th>GripSpeed</th>
            <th>EstimateCarry</th>
            <th>ATTACK ANGLE</th>
            <th>SWING TYPE</th>
            <th>FACE ANGLE</th>
            <th>Hand First</th>
            <th>Attack Angle</th>
            <th>FacetoPath</th>
            <th>Halfwayback Face Angle</th>
            <th>Down Swing Shaft Rotation</th>
            <th>Top Face Angle</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              <td>{row.club_type || "-"}</td>
              <td>{row.profileHeight} cm</td>
              <td>{row.impactHeadSpeed.toFixed(2)} m/s</td>
              <td>{row.impactGripSpeed.toFixed(2)} m/s</td>
              <td>{row.estimateCarry.toFixed(2)} yard</td>
              <td>{row.impactAttackAngle.toFixed(2)} °</td>
              <td>{row.swing_type || "-"}</td>
              <td>{row.impactFaceAngle.toFixed(2)} °</td>
              <td>{row.impactHandFirst?.toFixed(2) || "-"}</td>
              <td>{row.impactAttackAngle?.toFixed(2) || "-"}</td>
              <td>{row.impactRelativeFaceAngle?.toFixed(2) || "-"}</td>
              <td>{row.halfwaybackFaceAngleToVertical?.toFixed(2) || "-"}</td>
              <td>{row.downSwingShaftRotationMax?.toFixed(2) || "-"}</td>
              <td>{row.topFaceAngleToHorizontal?.toFixed(2) || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ページネーション */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: "10px", marginRight: "10px" }}
        >
          前のページ
        </button>
        <span>ページ {currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          次のページ
        </button>
      </div>
    </div>
  );
}

