use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthRequest {
    pub kind: String,
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub ok: bool,
    pub next: Option<String>,
    pub uid: Option<String>,
}

impl AuthResponse {
    pub fn new(ok: bool, next: Option<String>, uid: Option<String>) -> AuthResponse {
        AuthResponse { ok, next, uid }
    }

    pub fn good(uid: String) -> AuthResponse {
        AuthResponse::new(true, None, Some(uid))
    }

    // pub fn exp() -> AuthResponse {}

    pub fn bad() -> AuthResponse {
        AuthResponse::new(false, None, None)
    }
}
