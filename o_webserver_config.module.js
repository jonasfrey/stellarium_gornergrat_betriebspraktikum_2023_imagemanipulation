var o_webserver_config = {
  o_default_domain_o_config: {
      s_default_file: "client.html",
  },
  o_not_encrypted:{        
      s_host: "::", // '::' = allow ipv4 and ipv6
      n_port: 8080,
      s_url: "http://localhost:${o_not_encrypted.n_port}/"
  },
  o_encrypted: {
      s_host: "::", // '::' = allow ipv4 and ipv6
      n_port: 8443,
      s_url: "https://localhost:${o_encrypted.n_port}/"
  },
  // s_host_name: "2606:4700:4700::1111"//one.one.one.one
  s_host_name: "[::1]", // ip6-localhost,
  o_ssl: {
      b_auto_generate: true,
      o_auto_generate:{
          b: true, 
          s_country_name_2_letter_code:'CH', 
          s_state_or_province:'Switzerland', 
          s_locality_name:'Bern', 
          s_organization_name:'MyCompany', 
          s_common_name:'MyCommonName', 
          s_email_address:'my.email@dom.com', 
      },
      s_path_certificate_file : "./self_signed_cert.crt", // 
      s_path_key_file : "./self_signed_key.key",
  }
}

import {f_evaluate_object} from "https://deno.land/x/f_evaluate_object@0.1/f_evaluate_object.module.js"

await f_evaluate_object(o_webserver_config,o_webserver_config)

export {o_webserver_config}