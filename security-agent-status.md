# Security-Agent Status

- Was ich gerade mache: Konsistenzprüfung zwischen `users.service.ts` und `auth.service.ts` bzgl. Passwort-Hashing und Salt-Rounds.
- Was fertig ist: `users.service.ts` verwendet `bcrypt` korrekt mit 12 Runden; `auth.service.ts` verwendet `BCRYPT_ROUNDS` aus der Umgebung mit Fallback 12.
- Nächste Schritte: Optional beide Services auf dieselbe Env-Variable vereinheitlichen (`BCRYPT_ROUNDS`), damit zentral konfigurierbar. Auf Wunsch implementiere ich das in `users.service.ts`.
- Probleme/Blocker: Keine; periodische automatisierte 30‑Sekunden-Updates nicht möglich ohne Hintergrundprozess. Ich aktualisiere manuell nach Änderungen.
