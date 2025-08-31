// src/utils/fetch.ts

/** 基礎解析：嘗試 JSON，失敗則回傳純文字或空物件；對 204 直接回空物件 */
async function parseResponse(res: Response) {
  if (res.status === 204) return {};
  const text = await res.text();          // 先拿文字，避免空 body 直接 .json() 失敗
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;                          // 後端不是 JSON，就回字串
  }
}

function handleError(res: Response) {
  // 讓呼叫端能 catch 到 HTTP 錯誤
  const err = new Error(`HTTP ${res.status} ${res.statusText}`);
  // @ts-expect-error 自訂欄位
  err.status = res.status;
  throw err;
}

/** GET（預期回 JSON，但也容忍純文字/空回應） */
export async function asyncGet(url: string): Promise<any> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) handleError(res);
  return parseResponse(res);
}

/** 通用送出器（自動處理 FormData / JSON） */
async function send(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: {} | FormData
): Promise<any> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  // 只有在不是 FormData 時才設 JSON content-type
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers,
    body:
      body === undefined
        ? undefined
        : isForm
        ? (body as FormData)
        : JSON.stringify(body),
  });

  if (!res.ok) handleError(res);
  return parseResponse(res);
}

export function asyncPost(url: string, body: {} | FormData) {
  return send("POST", url, body);
}
// src/utils/fetch.ts（只貼 asyncPut；其他函式不動）
export async function asyncPut(api: string, body: {} | FormData): Promise<any> {
  try {
    const res: Response = await fetch(api, {
      method: 'PUT',
      credentials: 'include',
      headers: new Headers({
        'Access-Control-Allow-Origin': 'http://localhost:5173/',
        'Content-Type': 'application/json',
      }),
      body: body instanceof FormData ? body : JSON.stringify(body),
      mode: 'cors',
    });

    // 嘗試解析 JSON；有些錯誤回應可能沒有 JSON
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      // 失敗統一回物件，前端可讀
      return {
        ok: false,
        code: res.status,
        status: res.status,
        message: data?.message || data?.msg || res.statusText || 'Request failed',
      };
    }

    // 成功回資料（若後端沒 body，就給個預設 ok）
    return data ?? { ok: true, code: 200 };
  } catch (error: any) {
    // 網路/其他例外
    return {
      ok: false,
      code: 0,
      status: 0,
      message: error?.message || 'Network error',
    };
  }
}
export function asyncPatch(url: string, body: {} | FormData) {
  return send("PATCH", url, body);
}
/** DELETE：容許有或沒有 body、容許 204/空 body */
export function asyncDelete(url: string, body?: {} | FormData) {
  return send("DELETE", url, body);
}

/* ---------------------------------------------
 *  相容小工具：後端不吃 DELETE JSON 時，退而求其次
 * --------------------------------------------- */
export async function deleteCompat(
  url: string,
  payload: Record<string, string>
) {
  // Plan A：DELETE with JSON body
  try {
    return await asyncDelete(url, payload);
  } catch (e) {
    // 繼續嘗試
  }
  // Plan B：POST /remove（許多專案用這招）
  try {
    return await asyncPost(url, payload);
  } catch (e) {
    // 再繼續
  }
  // Plan C：DELETE + querystring
  const qs =
    "?" +
    Object.entries(payload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
  return await asyncDelete(url + qs);
}