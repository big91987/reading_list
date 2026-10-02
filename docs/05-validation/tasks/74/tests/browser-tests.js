const storageKey = "page-between-reading-list";
const frame = document.querySelector("#product");
const details = document.querySelector("#details");
const result = document.querySelector("#result");
const records = [];
const measurements = [];
const browserErrors = [];
let productWindow;
let productDocument;
const baseBooks = [
  { title: "A", read: true, legacy: { edition: 2 } },
  { title: "B", read: false },
  { title: "C", read: false },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function equal(actual, expected, message) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}: ${JSON.stringify(actual)}`,
  );
}

function control(selector) {
  const element = productDocument.querySelector(selector);
  assert(Boolean(element), `Missing ${selector}`);
  return element;
}

function memory() {
  return JSON.parse(productWindow.eval("JSON.stringify(books)"));
}

async function openProduct(raw, width = 1280) {
  if (raw !== undefined) {
    if (raw === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, raw);
  }
  frame.style.width = `${width}px`;
  await new Promise((resolve) => {
    frame.onload = resolve;
    frame.src = `product-under-test-74.html?visit=${Date.now()}&case=${records.length}`;
  });
  productWindow = frame.contentWindow;
  productDocument = frame.contentDocument;
  productWindow.addEventListener("error", (event) =>
    browserErrors.push(event.message),
  );
  await new Promise((resolve) => productWindow.requestAnimationFrame(resolve));
}

function counts(all, unread, read) {
  const expected = { all, unread, read };
  assert(all === unread + read, "Count invariant");
  for (const [name, count] of Object.entries(expected)) {
    const button = control(`[data-filter=${name}]`);
    equal(
      Number(button.querySelector(".filter-count").textContent),
      count,
      name,
    );
    assert(!button.disabled, "Zero-count filters stay enabled");
    assert(!button.hasAttribute("aria-label"), "Name includes visible count");
    assert(!button.querySelector("[aria-hidden=true]"), "Count not hidden");
  }
  equal(
    control("#reading-summary").textContent,
    `共 ${all} 本 · 已读 ${read} 本`,
    "Summary agrees",
  );
}

function filter(name) {
  control(`[data-filter=${name}]`).click();
  equal(
    [...productDocument.querySelectorAll('[aria-pressed="true"]')].map(
      (button) => button.dataset.filter,
    ),
    [name],
    "Single active filter",
  );
}

function add(title) {
  control("#book-title").value = title;
  control("#book-form").requestSubmit();
}

function action(title, selector) {
  const row = [...productDocument.querySelectorAll(".book-item")].find(
    (item) =>
      item.querySelector("input[type=checkbox]").getAttribute("aria-label") ===
      `标记《${title}》为已读`,
  );
  assert(Boolean(row), `Missing book ${title}`);
  row.querySelector(selector).click();
}

function unchanged(snapshot, raw) {
  equal(memory(), snapshot, "Memory unchanged");
  equal(localStorage.getItem(storageKey), raw, "Storage unchanged");
}

function failStorage(name) {
  const prototype = productWindow.Storage.prototype;
  const original = prototype.setItem;
  prototype.setItem = function (key, value) {
    if (key === storageKey)
      throw new productWindow.DOMException("Storage boundary injection", name);
    return original.call(this, key, value);
  };
  return () => {
    prototype.setItem = original;
  };
}

async function test(name, ac, run) {
  try {
    await run();
    records.push({ name, ac, passed: true });
  } catch (error) {
    records.push({ name, ac, passed: false, failure: error.message });
  }
  details.textContent = JSON.stringify({
    records,
    measurements,
    browserErrors,
  });
}

async function run() {
  const previous = localStorage.getItem(storageKey);
  try {
    await test("全量筛选/重复渲染/按钮身份", "AC-01,02,10", async () => {
      await openProduct(JSON.stringify(baseBooks));
      const buttons = [...productDocument.querySelectorAll("[data-filter]")];
      const raw = localStorage.getItem(storageKey);
      equal(
        buttons.map((button) => button.dataset.filter),
        ["all", "unread", "read"],
        "Order",
      );
      for (const name of ["read", "unread", "all"]) {
        filter(name);
        counts(3, 2, 1);
        equal(
          productDocument.querySelectorAll(".book-item").length,
          name === "read" ? 1 : name === "unread" ? 2 : 3,
          "Visible rows",
        );
      }
      buttons[1].focus();
      productWindow.eval("render(); render()");
      assert(
        productDocument.activeElement === buttons[1],
        "Filter focus retained",
      );
      equal(
        [...productDocument.querySelectorAll("[data-filter]")].map(
          (button, index) => button === buttons[index],
        ),
        [true, true, true],
        "Button identities retained",
      );
      unchanged(baseBooks, raw);
    });
    await test("成功动作逐项刷新", "AC-03,04,05", async () => {
      await openProduct(JSON.stringify(baseBooks));
      add("D");
      counts(4, 3, 1);
      await openProduct();
      counts(4, 3, 1);
      filter("unread");
      action("B", "input[type=checkbox]");
      counts(4, 2, 2);
      equal(
        productDocument.querySelectorAll(".book-item").length,
        2,
        "Moved out of unread",
      );
      await openProduct();
      counts(4, 2, 2);
      filter("read");
      action("B", "input[type=checkbox]");
      counts(4, 3, 1);
      await openProduct();
      counts(4, 3, 1);
      action("A", ".delete-button");
      counts(3, 3, 0);
      await openProduct();
      counts(3, 3, 0);
      action("B", ".delete-button");
      counts(2, 2, 0);
      await openProduct();
      counts(2, 2, 0);
    });
    for (const [name, books, expected] of [
      ["空集合", [], [0, 0, 0]],
      ["仅未读", [{ title: "B", read: false }], [1, 1, 0]],
      ["仅已读", [{ title: "A", read: true }], [1, 0, 1]],
    ]) {
      await test(name, "AC-06", async () => {
        await openProduct(JSON.stringify(books));
        for (const selection of ["read", "unread", "all"]) {
          filter(selection);
          counts(...expected);
          const visible = books.filter(
            (book) =>
              selection === "all" ||
              (selection === "read" ? book.read : !book.read),
          );
          equal(
            productDocument.querySelectorAll(".book-item").length,
            visible.length,
            "Empty/category rows",
          );
          if (visible.length === 0) {
            equal(control("#empty-state").hidden, false, "Empty state visible");
            equal(
              control("#empty-title").textContent,
              books.length === 0
                ? "清单还是空的"
                : selection === "read"
                  ? "还没有读完的书"
                  : "没有未读的书",
              "Existing empty message",
            );
          }
        }
      });
    }
    for (const [name, raw, expected] of [
      ["首次无存储", null, []],
      ["损坏JSON", "{broken", []],
      ["非数组", '{"title":"A","read":true}', []],
      [
        "部分无效条目",
        JSON.stringify([
          null,
          1,
          { title: "坏", read: "true" },
          { read: false },
          ...baseBooks,
        ]),
        baseBooks,
      ],
      [
        "历史重复/长标题/未知字段",
        JSON.stringify([
          { title: "重复", read: true, old: 7 },
          { title: "重复", read: false },
          { title: "长".repeat(100), read: false },
        ]),
        [
          { title: "重复", read: true, old: 7 },
          { title: "重复", read: false },
          { title: "长".repeat(100), read: false },
        ],
      ],
    ]) {
      await test(name, "AC-05,10", async () => {
        await openProduct(raw);
        const read = expected.filter((book) => book.read).length;
        counts(expected.length, expected.length - read, read);
        unchanged(expected, raw);
      });
    }
    await test("无效新增与编辑不改计数", "AC-07,08", async () => {
      await openProduct(JSON.stringify(baseBooks));
      const raw = localStorage.getItem(storageKey);
      for (const title of [" ", "a"]) {
        add(title);
        counts(3, 2, 1);
        unchanged(baseBooks, raw);
      }
      action("B", "[data-edit-index]");
      control(".edit-input").value = " ";
      control(".edit-form").requestSubmit();
      counts(3, 2, 1);
      unchanged(baseBooks, raw);
      equal(
        control(".edit-input").getAttribute("aria-invalid"),
        "true",
        "Edit validation",
      );
      control(".edit-controls button:last-child").click();
      counts(3, 2, 1);
      action("B", "[data-edit-index]");
      control(".edit-input").value = "新版B";
      control(".edit-form").requestSubmit();
      counts(3, 2, 1);
      await openProduct();
      counts(3, 2, 1);
      equal(
        memory().map((book) => book.title),
        ["A", "新版B", "C"],
        "Edit order",
      );
    });
    for (const error of ["QuotaExceededError", "SecurityError"]) {
      for (const command of ["add", "delete", "read", "edit"]) {
        await test(`${error}/${command}/恢复重试`, "AC-07,08,10", async () => {
          await openProduct(JSON.stringify(baseBooks));
          const raw = localStorage.getItem(storageKey);
          const restore = failStorage(error);
          try {
            if (command === "add") add("D");
            else if (command === "delete") action("A", ".delete-button");
            else if (command === "read") action("B", "input[type=checkbox]");
            else {
              action("A", "[data-edit-index]");
              control(".edit-input").value = "新版A";
              control(".edit-form").requestSubmit();
            }
            counts(3, 2, 1);
            unchanged(baseBooks, raw);
            const message =
              command === "add"
                ? "未能添加，请重试。"
                : command === "delete"
                  ? "未能删除，请重试。"
                  : command === "read"
                    ? "未能保存阅读状态，请重试。"
                    : "未能保存，原书名未改变。请重试或取消。";
            assert(
              productDocument.body.textContent.includes(message),
              "Exact failure feedback",
            );
            if (command === "read")
              equal(
                control('[data-row-index="1"] input[type=checkbox]').checked,
                false,
                "Checkbox restored",
              );
          } finally {
            restore();
          }
          if (command === "add") add("D");
          else if (command === "delete") action("A", ".delete-button");
          else if (command === "read") action("B", "input[type=checkbox]");
          else control(".edit-form").requestSubmit();
          const expected =
            command === "add"
              ? [4, 3, 1]
              : command === "delete"
                ? [2, 2, 0]
                : command === "read"
                  ? [3, 1, 2]
                  : [3, 2, 1];
          counts(...expected);
          equal(
            JSON.parse(localStorage.getItem(storageKey)),
            memory(),
            "Success saved exactly once",
          );
          await openProduct();
          counts(...expected);
        });
      }
    }
    for (const width of [320, 375, 430, 431, 640, 641, 650, 651, 1280]) {
      await test(`四位数布局${width}px`, "AC-09", async () => {
        const books = Array.from({ length: 2000 }, (_, index) => ({
          title: `书籍${index}`,
          read: index < 1000,
        }));
        await openProduct(JSON.stringify(books), width);
        filter("read");
        counts(2000, 1000, 1000);
        const buttons = [...productDocument.querySelectorAll("[data-filter]")];
        const bounds = buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          assert(rect.height >= 44, "Minimum target height");
          assert(rect.left >= 0 && rect.right <= width, "Button in viewport");
          assert(button.scrollWidth <= button.clientWidth, "No clipped label");
          equal(
            productWindow.getComputedStyle(button).whiteSpace,
            "nowrap",
            "Whole button text",
          );
          return {
            label: button.textContent.trim(),
            left: rect.left,
            right: rect.right,
            top: rect.top,
            height: rect.height,
          };
        });
        assert(
          productDocument.documentElement.scrollWidth <= width,
          "No page horizontal overflow",
        );
        if (width === 320)
          assert(
            new Set(bounds.map((bound) => bound.top)).size > 1,
            "Whole buttons wrap at 320",
          );
        measurements.push({ width, bounds });
      });
    }
  } finally {
    if (previous === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, previous);
  }
  const failed = records.filter((record) => !record.passed);
  result.textContent =
    failed.length || browserErrors.length
      ? `集成失败：${failed.length}，浏览器错误：${browserErrors.length}`
      : `集成通过：${records.length} 项，浏览器错误：0`;
  details.textContent = JSON.stringify(
    {
      records,
      measurements,
      browserErrors,
      scope: "真实浏览器产品DOM/Storage边界异常注入；非物理配额耗尽/触摸/读屏",
    },
    null,
    2,
  );
  document.querySelector("#download").hidden = false;
}

document.querySelector("#run").addEventListener("click", () => {
  document.querySelector("#run").disabled = true;
  run().catch((error) => {
    result.textContent = `夹具执行失败：${error.message}`;
  });
});
document.querySelector("#download").addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([details.textContent], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "product-integration-74.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector("#sample").addEventListener("click", () => {
  localStorage.setItem(storageKey, JSON.stringify(baseBooks));
  location.replace("product-under-test-74.html");
});
document.querySelector("#large").addEventListener("click", () => {
  localStorage.setItem(
    storageKey,
    JSON.stringify(
      Array.from({ length: 2000 }, (_, index) => ({
        title: `书籍${index}`,
        read: true,
      })),
    ),
  );
  location.replace("product-under-test-74.html");
});
