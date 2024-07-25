import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Error "mo:base/Error";
import Text "mo:base/Text";
//custom Types
import Types "Types";

actor {
  public func get_icp_usd_exchange(start : Nat, end : Nat, pair : Text) : async Text {
    //1. MANAGEMENT CANISTER
    let ic : Types.IC = actor ("aaaaa-aa");
    //2. ARGUEMENTS
    //2.1 Url and query params
    let ONE_MINUTE : Nat64 = 60;
    let ONE_HOUR : Nat64 = 3600;
    //unix timestamp
    let start_timestamp : Types.Timestamp = Nat64.fromNat(start); //start date
    let end_timestamp : Types.Timestamp = Nat64.fromNat(end); //End date
    let host : Text = "api.pro.coinbase.com";
    let url = "https://" # host # "/products/" # pair # "/candles?start=" # Nat64.toText(start_timestamp) # "&end=" # Nat64.toText(end_timestamp) # "&granularity=" # Nat64.toText(ONE_HOUR);
    //2.2 headers for system http call
    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "exchange_rate_canister" },
    ];
    //2.2.1 Transform context
    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };
    //2.3 Http request
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = null;
      method = #get;
      transform = ?transform_context;
    };

  //3 CYCLES
  Cycles.add(20_949_972_000);
  //4 MAKE CALL AND WAIT FOR RESPONSE
  let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
  //DECODE RESPONSE
  //Response body is received as Nat8, hence to decode:
  let response_body : Blob = Blob.fromArray(http_response.body); //convert to blob
  //convert blob to Text optional
  //switch handles null
  let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
    case (null) { "No value returned" };
    case (?y) { y };
  };
  //6. RETURN RESPONSE BODY
  decoded_text;
  };

//Headers in a response may not be identical across nodes, hence "no consensus", the response can be edited using the transform function
//Transform function is run before consensus and can be used to remove some headers from the response
  //7. Transform function
  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
    let transformed : Types.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = [
        {
          name = "Context-Security-Policy";
          value = "default-src 'self'";
        },
        { name = "Referrer-Policy"; value = "strict-origin" },
        { name = "Permissions-Policy"; value = "geolocation=(self)" },
        {
          name = "Strict-Transport-Security";
          value = "max-age=63072000";
        },
        { name = "X-Frame-Options"; value = "DENY" },
        { name = "X-Content-Type-Options"; value = "nosniff" },
      ];
    };
    transformed;
  };
};
