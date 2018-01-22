interface JWTPayload {
    admin?: boolean;
    cid: string;
    exp: number;
    iat: number;
    id:  string;
    iss: "api.featherback.co";
    root?: boolean;
}

declare namespace Express {
    export interface Request {
        jwt: JWTPayload;
        username: string;
        password: string;
    }
}
