$runtimeRoot = "C:\Users\yashv\.cache\codex-runtimes\codex-primary-runtime\dependencies"
$env:Path = "$runtimeRoot\node\bin;$runtimeRoot\bin\fallback;$env:Path"

& "$runtimeRoot\bin\fallback\pnpm.cmd" run dev
