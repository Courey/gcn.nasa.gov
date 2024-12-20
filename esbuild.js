import esbuild from 'esbuild'
import { copyFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { extname } from 'node:path'
import { basename, dirname, join } from 'path'

const args = process.argv.slice(2)
const dev = args.includes('--dev')
const entryPoints = await glob(
  './app/{email-incoming,scheduled,table-streams}/*/index.ts'
)

/**
 * @type {esbuild.BuildOptions}
 */
const options = {
  bundle: true,
  entryPoints,
  logLevel: 'info',
  outdir: 'build',
  outbase: 'app',
  outExtension: { '.js': '.cjs' },
  external: ['@aws-sdk/*', 'aws-sdk'],
  platform: 'node',
  target: ['node20'],
  minify: !dev,
  sourcemap: true,
  sourcesContent: false,
  metafile: true,
  loader: { '.node': 'empty' },
  plugins: [
    {
      name: 'copy Node API modules to output directories',
      setup(build) {
        build.onEnd(async ({ metafile: { outputs } }) => {
          await Promise.all(
            Object.entries(outputs).flatMap(([entryPoint, { inputs }]) =>
              Object.keys(inputs)
                .filter((input) => extname(input) === '.node')
                .map((input) =>
                  copyFile(input, join(dirname(entryPoint), basename(input)))
                )
            )
          )
        })
      },
    },
    {
      name: 'write metafile to output directory',
      setup(build) {
        build.onEnd(async ({ metafile }) => {
          await writeFile(
            join(build.initialOptions.outdir, 'metafile.lambda.json'),
            JSON.stringify(metafile)
          )
        })
      },
    },
  ],
}

if (dev) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
} else {
  await esbuild.build(options)
}
