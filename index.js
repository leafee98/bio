import nunjucks from "nunjucks"
import toml from "toml";
import fs from "fs";
import path from "path";
import { program } from "commander";
import { v4 as uuidv4 } from "uuid";
import express from "express";

const url_path      = "/";
const template_dir  = "template/";
const template_path = "index.html.njk";
const output_path   = "dist/index.html";
var config_path   = "config.toml";

function main() {
  program
    .option("--serve", "serve the gerneated files")
    .option("--generate", "generate prod ready files")
    .option("--config <config>", "config file you use, config-example.toml as example");
  program.parse();
  const options = program.opts();

  if (options.serve && options.generate
      || ! (options.serve || options.generate)) {
    program.help();
  }

  if (options.config) {
    config_path = options.config;
  }

  let config = fs.readFileSync(config_path, {encoding: "utf-8"});
  config = toml.parse(config)

  for (let i = 0; i < config["section"].length; i++) {
    for (let j = 0; j < config["section"][i]["items"].length; j++) {
      let item = config["section"][i]["items"][j];
      if (item.hide_permalink) {
        let seed = Math.floor(Math.random() * 1000000007)
        item.permalink = hide(seed, item.permalink);
        item.seed = seed;
      }
    }
  }

  let nunjucks_env = nunjucks.configure(template_dir, {
    autoescape: true,
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  if (options.serve) {
    serve(config, nunjucks_env);
  }

  if (options.generate) {
    generate(config, nunjucks_env);
  }
};

function serve(config, nunjucks_env) {
  config.dev = true;
  const rendered = nunjucks_env.render(template_path, config);

  const app = express();
  const port = 3000;

  const uuid = uuidv4();

  app.get("/uuid", (req, res) => {
    res.set('Cache-Control', 'no-store')
    res.send(uuid);
  });
  app.get("/", (req, res) => {
    res.set('Cache-Control', 'no-store')
    res.send(rendered)
  });
  app.listen(port, () => {
    console.log(`serveing webpage at ${port}`);
  });
}

function generate(config, nunjucks_env) {
  const rendered = nunjucks_env.render(template_path, config);
  if (! fs.existsSync(path.dirname(output_path))) {
    fs.mkdirSync(path.dirname(output_path), { recursive: true });
  }
  fs.writeFileSync(output_path, rendered);
}

// A simple function to encrypt string
// to avoid being collected by robots.
function hide(seed, str) {
  const str_arr = new TextEncoder().encode(str);
  const res_arr = [];
  seed %= 1000000007;

  for (let i = 0; i < str_arr.length; i++) {
    res_arr.push((str_arr[i] + seed) % 256);
    seed = seed * seed % 1000000007;
  }


  return res_arr;
}

function unhide(seed, arr) {
  seed %= 1000000007;
  const str_arr = [];
  for (let i = 0; i < arr.length; i++) {
    str_arr.push((((arr[i] - seed) % 256) + 256) % 256)
    seed = seed * seed % 1000000007;
  }

  const ui8_arr = new Uint8Array(str_arr);
  const str = new TextDecoder().decode(ui8_arr);
  return str;
}

main();
