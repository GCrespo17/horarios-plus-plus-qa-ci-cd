import { describe, it, expect } from "bun:test";
import { Section, Subject, Career, Session } from "./classes.js";

describe("Section.mismaMateria", () => {
  it("returns true when both sections reference the same Subject instance", () => {
    const career = new Career("Engineering");
    const subject = new Subject("Mathematics", [], career);
    const section1 = new Section("001", "Prof A", [], subject);
    const section2 = new Section("002", "Prof B", [], subject);

    expect(Section.mismaMateria(section1, section2)).toBe(true);
  });

  it("returns false when sections reference different Subject instances even if names match", () => {
    const career = new Career("Engineering");
    const subjectA = new Subject("Physics", [], career);
    const subjectB = new Subject("Physics", [], career);
    const section1 = new Section("101", "Prof X", [], subjectA);
    const section2 = new Section("102", "Prof Y", [], subjectB);

    expect(Section.mismaMateria(section1, section2)).toBe(false);
  });
});

describe("Section.sonCompatibles", () => {
  it("returns false when a session in section1 starts during a session in section2", () => {
    const career = new Career("Engineering");
    const subjA = new Subject("A", [], career);
    const subjB = new Subject("B", [], career);

    const s1 = new Session(
      new Date(2025, 0, 1, 10, 30),
      new Date(2025, 0, 1, 11, 30)
    );
    const s2 = new Session(
      new Date(2025, 0, 1, 10, 0),
      new Date(2025, 0, 1, 11, 0)
    );

    const sec1 = new Section("001", "T1", [s1], subjA);
    const sec2 = new Section("002", "T2", [s2], subjB);

    expect(Section.sonCompatibles(sec1, sec2)).toBe(false);
  });

  it("returns false when a session in section1 ends during a session in section2", () => {
    const career = new Career("Engineering");
    const subjA = new Subject("A", [], career);
    const subjB = new Subject("B", [], career);

    const s1 = new Session(
      new Date(2025, 0, 1, 9, 0),
      new Date(2025, 0, 1, 10, 15)
    );
    const s2 = new Session(
      new Date(2025, 0, 1, 10, 0),
      new Date(2025, 0, 1, 11, 0)
    );

    const sec1 = new Section("003", "T3", [s1], subjA);
    const sec2 = new Section("004", "T4", [s2], subjB);

    expect(Section.sonCompatibles(sec1, sec2)).toBe(false);
  });

  it("returns false when sessions touch boundaries (end equals start) — considered incompatible", () => {
    const career = new Career("Engineering");
    const subjA = new Subject("A", [], career);
    const subjB = new Subject("B", [], career);

    const s1 = new Session(
      new Date(2025, 0, 1, 9, 0),
      new Date(2025, 0, 1, 10, 0)
    );
    const s2 = new Session(
      new Date(2025, 0, 1, 10, 0),
      new Date(2025, 0, 1, 11, 0)
    );

    const sec1 = new Section("005", "T5", [s1], subjA);
    const sec2 = new Section("006", "T6", [s2], subjB);

    expect(Section.sonCompatibles(sec1, sec2)).toBe(false);
  });

  it("returns true when none of the sessions overlap", () => {
    const career = new Career("Engineering");
    const subjA = new Subject("A", [], career);
    const subjB = new Subject("B", [], career);

    const s1 = new Session(
      new Date(2025, 0, 1, 8, 0),
      new Date(2025, 0, 1, 9, 0)
    );
    const s2 = new Session(
      new Date(2025, 0, 1, 9, 30),
      new Date(2025, 0, 1, 10, 30)
    );

    const sec1 = new Section("007", "T7", [s1], subjA);
    const sec2 = new Section("008", "T8", [s2], subjB);

    expect(Section.sonCompatibles(sec1, sec2)).toBe(true);
  });

  it("returns false when any session pair between sections overlaps (multiple sessions per section)", () => {
    const career = new Career("Engineering");
    const subjA = new Subject("A", [], career);
    const subjB = new Subject("B", [], career);

    const s1a = new Session(
      new Date(2025, 0, 1, 8, 0),
      new Date(2025, 0, 1, 9, 0)
    );
    const s1b = new Session(
      new Date(2025, 0, 1, 10, 0),
      new Date(2025, 0, 1, 11, 0)
    ); // overlaps with s2b
    const s2a = new Session(
      new Date(2025, 0, 1, 9, 15),
      new Date(2025, 0, 1, 9, 45)
    );
    const s2b = new Session(
      new Date(2025, 0, 1, 10, 30),
      new Date(2025, 0, 1, 11, 30)
    );

    const sec1 = new Section("009", "T9", [s1a, s1b], subjA);
    const sec2 = new Section("010", "T10", [s2a, s2b], subjB);

    expect(Section.sonCompatibles(sec1, sec2)).toBe(false);
  });
});
