import { BigQuery } from "@google-cloud/bigquery";

export async function GET() {
  try {
    // 環境変数から取得した秘密鍵の処理
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
    
    // 秘密鍵の改行文字を確実に処理
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    
    // もし秘密鍵が BEGIN/END タグをまだ含んでいない場合（省略形式の場合）
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
    }

    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL
    };

    // 認証情報の検証（秘密鍵の内容は出力しない）
    console.log("Credentials check:", {
      has_project_id: !!credentials.project_id,
      has_client_email: !!credentials.client_email,
      private_key_length: credentials.private_key?.length || 0,
      private_key_start: credentials.private_key?.substring(0, 27) || ""
    });

    const bigquery = new BigQuery({
      projectId: credentials.project_id,
      credentials
    });
    
    // 簡単なテストクエリを実行
    const [testResult] = await bigquery.query("SELECT 1 as test");
    console.log("Test query success:", testResult);

    
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
    
    // エラー詳細を返す
    return new Response(
      JSON.stringify({ 
        error: "データ取得に失敗しました", 
        details: error.message,
        stack: error.stack,
        env_check: {
          has_project_id: !!process.env.GOOGLE_PROJECT_ID,
          has_client_email: !!process.env.GOOGLE_CLIENT_EMAIL,
          has_private_key: !!process.env.GOOGLE_PRIVATE_KEY,
          private_key_length: process.env.GOOGLE_PRIVATE_KEY?.length || 0
        }
      }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}


