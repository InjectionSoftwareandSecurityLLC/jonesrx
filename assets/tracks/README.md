# ALTER — Early Access Demo Tracks

Drop your demo tracks here as **base64-encoded** text files. Name them `demo-01.dat`
through `demo-09.dat`.

```
assets/tracks/
├── demo-01.dat   ← ALTER — Demo 1  (Raphael)
├── demo-02.dat   ← ALTER — Demo 2  (Michael)
├── demo-03.dat   ← ALTER — Demo 3  (Michael)
├── demo-04.dat   ← ALTER — Demo 4  (Gabriel)
├── demo-05.dat   ← ALTER — Demo 5  (Gabriel)
├── demo-06.dat   ← ALTER — Demo 6  (Gabriel)
├── demo-07.dat   ← ALTER — Demo 7  (Uriel)
├── demo-08.dat   ← ALTER — Demo 8  (Uriel)
└── demo-09.dat   ← ALTER — Demo 9  (Uriel)
```

Create one from an mp3:

```
base64 -i mytrack.mp3 -o demo-01.dat
```

## How unlocking works
The 9 demos are gated behind the four archangel sigils, invoked by completing
the terminal hacking game (Raphael 1, Michael 2, Gabriel 3, Uriel 3). Once an
archangel is invoked, its demos appear in the **Tracks** app, where the `.dat`
is decoded to an in-memory blob and streamed.

To rename a demo or change the mapping, edit the `DEMOS` array near the top of
`js/os.js`.
