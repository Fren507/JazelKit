TODO.md
=======

Aufgabenübersicht
-----------------

Allgemein
~~~~~~~~~

- ☐ Projektstruktur dokumentieren
- ☐ README-Datei aktualisieren
- ☐ Tests für alle Module hinzufügen
- ☒ Durchdrehen

Framework
~~~~~~~~~

- ☐ **``JazelKitConfig.ts``**: Standardwerte für alle
  Konfigurationsoptionen dokumentieren.
- ☐ **``build.ts``**: Fehlerbehandlung für fehlende Dateien verbessern.
- ☐ **``helpers.ts``**: Zusätzliche Hilfsfunktionen für häufige Aufgaben
  implementieren.
- ☐ **``layout.ts``**: Unterstützung für verschachtelte Layouts
  erweitern.
- ☐ **``main.ts``**: Logging-Optionen konfigurierbar machen.
- ☐ **``manipulateDom.ts``**: Mehr DOM-Manipulationsoptionen hinzufügen.

Tests
~~~~~

- ☐ Unit-Tests für ``helpers.ts`` schreiben.
- ☐ Integrationstests für ``build.ts`` und ``main.ts`` erstellen.
- ☐ End-to-End-Tests für das gesamte Framework implementieren.

Verbesserungen
~~~~~~~~~~~~~~

- ☒ ESLint und Prettier für konsistente Codequalität einrichten.
- ☐ TypeScript-Typen für alle Module überprüfen und verbessern.
- ☐ Automatisierte Builds und Tests in CI/CD-Pipeline integrieren.
- ☐ Automatisches Initalisierungsskript für neue Projekte erstellen.

Dokumentation
~~~~~~~~~~~~~

- ☐ Beispiele für die Nutzung des Frameworks hinzufügen.

- ☐ API-Dokumentation für alle öffentlichen Funktionen erstellen.

- ☐ Changelog für zukünftige Versionen vorbereiten.

- ☐ Füge Dokumentationen zu den Funktionen hinzu, z.B.:

  .. code:: typescript

     /**
      * Funktion zum Beispiel
      * @param param1 - Beschreibung von param1
      * @returns Beschreibung des Rückgabewerts
      */
     function exampleFunction(param1: string): string {
       // Funktionalität hier
       return `Ergebnis: ${param1}`;
     }
