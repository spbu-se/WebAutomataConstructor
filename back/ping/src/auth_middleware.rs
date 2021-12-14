use actix_service::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::http::HeaderMap;
use actix_web::{Error, HttpMessage, HttpResponse};
use core::intercom::{AuthRequest, AuthResponse};
use futures::future::{ok, Ready};
use futures::Future;
use std::env;
use std::error;
use std::pin::Pin;
use std::task::{Context, Poll};

pub struct Authentication;

impl<S, B> Transform<S> for Authentication
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Error = Error;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;
    type InitError = ();
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Transform = AuthenticationMiddleware<S>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AuthenticationMiddleware { service })
    }
}

pub struct AuthenticationMiddleware<S> {
    service: S,
}

macro_rules! unauthorized {
    ($req:ident, $reason:literal) => {
        Box::pin(async move { Ok($req.into_response(HttpResponse::Unauthorized().body($reason).into_body())) })
    };
}

impl<S> AuthenticationMiddleware<S> {
    fn parse_headers<'a>(headers: &'a HeaderMap) -> Result<(&'a str, &'a str), Box<dyn error::Error>> {
        Ok((
            headers.get("tt").ok_or("no tt")?.to_str()?,
            headers.get("t").ok_or("no t")?.to_str()?,
        ))
    }
}

impl<S, B> Service for AuthenticationMiddleware<S>
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&mut self, req: ServiceRequest) -> Self::Future {
        let (token_type, token) = match Self::parse_headers(req.headers()) {
            Ok(result) => result,
            Err(_) => return unauthorized!(req, "bad auth headers"),
        };

        let auth_req = AuthRequest {
            kind: String::from(token_type),
            token: String::from(token),
        };

        let client = reqwest::blocking::Client::new();
        let res = client
            .post(env::var("AUTH_SERVICE_URL").unwrap()) // todo: move to .env
            .json(&auth_req)
            .send()
            .unwrap(); // todo: error handling

        let auth_res = res.json::<AuthResponse>().unwrap(); // todo: error handling

        if !auth_res.ok {
            if auth_res.next == None {
                return Box::pin(async move {
                    Ok(req.into_response(HttpResponse::Unauthorized().body("bad auth headers").into_body()))
                });
            }

            unimplemented!()
        }

        req.extensions_mut().insert(auth_res.uid.unwrap().clone());

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}
