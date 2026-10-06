# ALTER — Early Access Demo Tracks

Drop your demo tracks here as **base64-encoded** text files (so the raw mp3s
aren't directly downloadable from the directory). Name them `demo-01.b64`
through `demo-09.b64`.

```
assets/tracks/
├── demo-01.b64   ← ALTER — Demo 1  (Raphael)
├── demo-02.b64   ← ALTER — Demo 2  (Michael)
├── demo-03.b64   ← ALTER — Demo 3  (Michael)
├── demo-04.b64   ← ALTER — Demo 4  (Gabriel)
├── demo-05.b64   ← ALTER — Demo 5  (Gabriel)
├── demo-06.b64   ← ALTER — Demo 6  (Gabriel)
├── demo-07.b64   ← ALTER — Demo 7  (Uriel)
├── demo-08.b64   ← ALTER — Demo 8  (Uriel)
└── demo-09.b64   ← ALTER — Demo 9  (Uriel)
```

Create one from an mp3:

```
base64 -i mytrack.mp3 -o demo-01.b64
```

## How unlocking works
The 9 demos are gated behind the four archangel sigils, invoked by completing
the terminal hacking game (Raphael 1, Michael 2, Gabriel 3, Uriel 3). Once an
archangel is invoked, its demos appear in the **Tracks** app, where the `.b64`
is decoded to an in-memory blob and streamed.

To rename a demo or change the mapping, edit the `DEMOS` array near the top of
`js/os.js`.
