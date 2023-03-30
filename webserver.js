import {O_webserver} from "https://deno.land/x/o_webserver@8.6/O_webserver.module.js"


//windows
// var s_folder_separator = "\"
//linux
var s_folder_separator = "/"

var s_path_o_webserver_root = import.meta.url
        .split("file://")
        .pop()
        .split(s_folder_separator)
        .slice(0,-1)
        .join(s_folder_separator)

var o_webserver = new O_webserver(
    s_path_o_webserver_root
);

o_webserver.f_serve_all();