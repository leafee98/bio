import nunjucks from "nunjucks"
import toml from "toml";
import fs from "fs";
import path from "path";
import { program } from "commander";
import { v4 as uuidv4 } from "uuid";
import express from "express";

const url_path      = "/";
const config_path   = "config.toml";
const template_dir  = "template";
const template_path = "index.html.njk";
const output_path   = "dist/index.html";


function main() {
  program
    .option("--serve", "serve the gerneated files")
    .option("--generate", "generate prod ready files")
  program.parse();
  const options = program.opts();

  if (options.serve && options.generate
      || ! (options.serve || options.generate)) {
    program.help();
  }

  var config = fs.readFileSync(config_path, {encoding: "utf-8"});
  config = toml.parse(config)

  nunjucks.configure(template_dir, {
    autoescape: true,
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  if (options.serve) {
    serve(config);
  }

  if (options.generate) {
    generate(config);
  }
};


function serve(config) {
  config.dev = true;
  const rendered = nunjucks.render(template_path, config);

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

function generate(config) {
  const rendered = nunjucks.render(template_path, config);
  if (! fs.existsSync(path.dirname(output_path))) {
    fs.mkdirSync(fs.dirname(output_path), { recursive: true });
  }
  fs.writeFileSync(output_path, rendered);
}

main();
