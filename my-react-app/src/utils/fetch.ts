/**
 * 異步呼叫api, 只可用響應體為 json 的 api
 * @param api 要呼叫的api
 * @returns json 結果
 */
export async function asyncGet(api: string):Promise<any>{
    try {
        const res: Response = await fetch(api)
        try {
            return await res.json()
        } catch (error) {
            return error
        }
    } catch (error) {
        return error
    }
}

export async function asyncPost(api: string, body: {} | FormData) {
    const res: Response = await fetch(api, {
        method: 'POST',
        credentials: 'include',
        headers:new Headers({
            'Access-Control-Allow-Origin':"http://localhost:5173/",
            'content-Type':"application/json"
        }),
        body: body instanceof FormData?body:JSON.stringify(body),
        mode:"cors"
    })
    try {
        let data = res.json()
        return data
    } catch (error) {
        console.error(error)
    }
}

export async function asyncPatch(api: string, body: {} | FormData) {
    const res: Response = await fetch(api, {
        method: 'PATCH',
        headers:new Headers({
            'Access-Control-Allow-Origin':"http://localhost:5173/",
        }),
        body: body instanceof FormData?body:JSON.stringify(body),
        mode:"cors"
    })
    try {
        let data = res.json()
        return data
    } catch (error) {
        console.error(error)
    }
}

/**
 * 異步呼叫 DELETE api
 * @param api 要呼叫的 api
 * @param body 需要傳送的資料 (可選)
 * @returns json 結果
 */
export async function asyncDelete(api: string, body?: {} | FormData): Promise<any> {
    try {
        const res: Response = await fetch(api, {
            method: 'DELETE',
            credentials: 'include',
            headers: new Headers({
                'Access-Control-Allow-Origin': "http://localhost:5173/",
                'Content-Type': "application/json"
            }),
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined, // 如果有 body，則加上它
            mode: "cors"
        });

        try {
            let data = await res.json();
            return data;  // 返回结果
        } catch (error) {
            console.error("Error parsing response JSON:", error);
            return error;  // 解析 JSON 错误时返回错误
        }
    } catch (error) {
        console.error("Error with DELETE request:", error);
        return error;  // 请求失败时返回错误
    }
}

/**
 * 異步呼叫 PUT api
 * @param api 要呼叫的 api
 * @param body 需要傳送的資料
 * @returns json 結果
 */
export async function asyncPut(api: string, body: {} | FormData): Promise<any> {
    try {
        const res: Response = await fetch(api, {
            method: 'PUT',
            credentials: 'include',
            headers: new Headers({
                'Access-Control-Allow-Origin': "http://localhost:5173/",
                'Content-Type': "application/json"
            }),
            body: body instanceof FormData ? body : JSON.stringify(body),
            mode: "cors"
        });

        try {
            let data = await res.json();
            return data;  // 返回結果
        } catch (error) {
            console.error("Error parsing response JSON:", error);
            return error;  // 解析 JSON 错误时返回错误
        }
    } catch (error) {
        console.error("Error with PUT request:", error);
        return error;  // 请求失败时返回错误
    }
}