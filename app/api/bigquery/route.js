import { BigQuery } from "@google-cloud/bigquery";

export async function GET() {
  try {
    // 個別の環境変数から認証情報を作成
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL
    };

    // 認証情報の検証
    if (!credentials.client_email) {
      throw new Error("client_email が設定されていません");
    }
    if (!credentials.private_key) {
      throw new Error("private_key が設定されていません");
    }

    const bigquery = new BigQuery({
      projectId: credentials.project_id,
      credentials
    });    
    const query = `
      SELECT
        profileHeight,
        impactHeadSpeed,
        impactGripSpeed,
        estimateCarry,
        topFaceAngleToHorizontal,
        height_category,
        cluster,
        impactClubPath,
        impactHandFirst,
        impactAttackAngle,
        impactRelativeFaceAngle, 
        halfwaybackFaceAngleToVertical, 
        downSwingShaftRotationMax,
        impactAttackAngle,
        impactFaceAngle,
        maxHeadSpeed,
        swing_type,
        success,
        club_type,
        COALESCE(impactAttackAngle, 0) as impactAttackAngle,
        COALESCE(swing_type, '') as swing_type,
        COALESCE(club_type, '') as club_type
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.sample\`
      LIMIT 10000;
    `;
    const [rows] = await bigquery.query(query);
    return Response.json(rows);
  } catch (error) {
    console.error("BigQueryエラー:", error);
    return new Response(
      JSON.stringify({ 
        error: "データ取得に失敗しました", 
        details: error.message,
        env_check: {
          has_project_id: !!process.env.GOOGLE_PROJECT_ID,
          has_client_email: !!process.env.GOOGLE_CLIENT_EMAIL,
          has_private_key: !!process.env.GOOGLE_PRIVATE_KEY
        }
      }),
      { status: 500 }
    );
  }
}
