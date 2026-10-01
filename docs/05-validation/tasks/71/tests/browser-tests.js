const storageKey = "page-between-reading-list";
const frame = document.querySelector("#product");
const result = document.querySelector("#result");
const details = document.querySelector("#details");
let productWindow;
let productDocument;
const records = [];
const browserErrors = [];
const measurements = [];
const baseBooks = [
  { title: "长安的荔枝", read: false, legacy: { edition: 2 } },
  { title: "Dune", read: true },
  { title: "也许你该找个人聊聊", read: false },
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

function saved() {
  return JSON.parse(localStorage.getItem(storageKey));
}

function memory() {
  return JSON.parse(productWindow.eval("JSON.stringify(books)"));
}

async function openProduct(books, width = 1280) {
  if (books !== undefined)
    localStorage.setItem(storageKey, JSON.stringify(books));
  frame.style.width = `${width}px`;
  await new Promise((resolve) => {
    frame.onload = resolve;
    frame.src = `product-under-test-71.html?case=${records.length}&visit=${Date.now()}`;
  });
  productWindow = frame.contentWindow;
  productDocument = frame.contentDocument;
  productWindow.addEventListener("error", (event) =>
    browserErrors.push(event.message),
  );
  await new Promise((resolve) => productWindow.requestAnimationFrame(resolve));
}

function control(selector) {
  const element = productDocument.querySelector(selector);
  assert(Boolean(element), `Missing ${selector}`);
  return element;
}

function row(title) {
  return [...productDocument.querySelectorAll(".book-item")].find((item) => {
    const checkbox = item.querySelector("input[type=checkbox]");
    return checkbox.getAttribute("aria-label") === `标记《${title}》为已读`;
  });
}

function click(title, selector) {
  const item = row(title);
  assert(Boolean(item), `Missing book ${title}`);
  const element = item.querySelector(selector);
  assert(Boolean(element), `Missing ${selector} on ${title}`);
  element.click();
}

function edit(title, draft) {
  click(title, "[data-edit-index]");
  const input = control(".edit-input");
  assert(input.value === title, "Original title must be prefilled");
  assert(productDocument.activeElement === input, "Editor must receive focus");
  assert(
    input.selectionStart === 0 && input.selectionEnd === title.length,
    "Original title selected",
  );
  assert(
    productDocument.querySelectorAll(".edit-form").length === 1,
    "Single editor only",
  );
  if (draft !== undefined) fillDraft(draft);
  return input;
}

function fillDraft(value) {
  const input = control(".edit-input");
  input.value = value;
  input.dispatchEvent(new productWindow.Event("input", { bubbles: true }));
}

function submit() {
  control(".edit-form").requestSubmit();
}

function filter(name) {
  control(`[data-filter=${name}]`).click();
}

function add(title) {
  control("#book-title").value = title;
  control("#book-form").requestSubmit();
}

function key(input, name, options = {}) {
  const event = new productWindow.KeyboardEvent("keydown", {
    key: name,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  input.dispatchEvent(event);
  return event;
}

function unchanged(snapshot) {
  equal(saved(), snapshot, "Persisted snapshot unchanged");
  equal(memory(), snapshot, "In-memory snapshot unchanged");
}

function failure(name = "QuotaExceededError") {
  const prototype = productWindow.Storage.prototype;
  const original = prototype.setItem;
  prototype.setItem = function (keyName, value) {
    if (keyName === storageKey)
      throw new productWindow.DOMException(
        "Injected at actual browser Storage.setItem",
        name,
      );
    return original.call(this, keyName, value);
  };
  return () => {
    prototype.setItem = original;
  };
}

function errorState(message, draft) {
  equal(control(".edit-input").value, draft, "Raw draft retained");
  equal(control(".edit-error").textContent, message, "Error shown");
  equal(
    control(".edit-input").getAttribute("aria-invalid"),
    "true",
    "Invalid semantics",
  );
  assert(
    productDocument.activeElement === control(".edit-input"),
    "Error returns focus to input",
  );
  assert(
    !control("#operation-message").textContent.includes("已将书名保存"),
    "No misleading success",
  );
}

async function test(name, ac, action) {
  try {
    await action();
    records.push({ name, ac, passed: true });
  } catch (error) {
    records.push({ name, ac, passed: false, failure: error.message });
  }
  details.textContent = JSON.stringify({ records, browserErrors }, null, 2);
}

async function run() {
  const previous = localStorage.getItem(storageKey);
  records.length = 0;
  browserErrors.length = 0;
  measurements.length = 0;
  result.textContent = "正在运行";
  try {
    await test("已读与未读保存仅变更目标名称", [1, 5, 6], async () => {
      await openProduct(baseBooks);
      edit("长安的荔枝", "  修正后的荔枝  ");
      submit();
      const first = [
        { ...baseBooks[0], title: "修正后的荔枝" },
        ...baseBooks.slice(1),
      ];
      equal(saved(), first, "Unread rename preserves all fields/order");
      equal(memory(), first, "Memory commits same snapshot");
      assert(
        !productDocument.querySelector(".edit-form"),
        "Successful save exits editor",
      );
      assert(
        productDocument.activeElement.getAttribute("aria-label") ===
          "修改《修正后的荔枝》书名",
        "Success returns focus",
      );
      edit("Dune", "沙丘");
      submit();
      const expected = [first[0], { ...first[1], title: "沙丘" }, first[2]];
      equal(saved(), expected, "Read rename preserves snapshot");
      await openProduct();
      equal(
        memory(),
        expected,
        "Actual page revisit loads original key without migration",
      );
      assert(
        control("#reading-summary")
          .textContent.replace(/\s+/g, " ")
          .includes("共 3 本 · 已读 1 本"),
        "Summary unchanged",
      );
    });
    await test("空值和空白错误不写清单，直接修正可保存", [2], async () => {
      await openProduct(baseBooks);
      for (const draft of ["", "   "]) {
        if (!productDocument.querySelector(".edit-form")) edit("Dune");
        fillDraft(draft);
        submit();
        errorState("请填写书名，不能只输入空格。", draft);
        unchanged(baseBooks);
      }
      fillDraft("沙丘");
      submit();
      equal(
        saved()[1],
        { title: "沙丘", read: true },
        "Error can be corrected",
      );
    });
    await test("全清单去重包含筛选隐藏项，自身排除", [3, 4, 5], async () => {
      await openProduct(baseBooks);
      filter("unread");
      edit("长安的荔枝", " dune ");
      submit();
      errorState("清单中已有同名书籍，请换一个书名。", " dune ");
      unchanged(baseBooks);
      filter("read");
      for (const draft of ["Dune", " Dune ", "DUNE"]) {
        edit("Dune", draft);
        submit();
        equal(
          saved()[1],
          { title: draft.trim(), read: true },
          "Same-book changes allowed",
        );
        assert(
          control("[data-filter=read]").getAttribute("aria-pressed") === "true",
          "Filter preserved",
        );
      }
    });
    await test(
      "80/81 UTF16 边界、不截断、内部空白和符号安全",
      [4, 11],
      async () => {
        await openProduct(baseBooks);
        const eighty = "书".repeat(80);
        const over = "书".repeat(81);
        const input = edit("Dune", over);
        assert(
          !input.hasAttribute("maxlength"),
          "No silent truncation attribute",
        );
        submit();
        errorState("书名不能超过 80 个长度单位，请缩短后保存。", over);
        unchanged(baseBooks);
        fillDraft(eighty);
        submit();
        equal(saved()[1].title, eighty, "80 boundary preserved");
        edit(eighty, "😀".repeat(41));
        submit();
        errorState(
          "书名不能超过 80 个长度单位，请缩短后保存。",
          "😀".repeat(41),
        );
        fillDraft("😀".repeat(40));
        submit();
        const unsafe = "  <img src=x onerror=alert(1)>  中间  空白  ";
        edit("😀".repeat(40), unsafe);
        submit();
        equal(
          saved()[1].title,
          unsafe.trim(),
          "Only surrounding spaces trimmed",
        );
        assert(
          row(unsafe.trim()).querySelector(".book-title").textContent ===
            unsafe.trim(),
          "Name is plain text",
        );
        assert(
          !productDocument.querySelector(".book-list img"),
          "No HTML interpretation",
        );
      },
    );
    await test("全部、未读、已读保存保持筛选和其他数据", [5], async () => {
      for (const name of ["all", "unread", "read"]) {
        await openProduct(baseBooks);
        filter(name);
        const index = name === "read" ? 1 : 0;
        const expected = baseBooks.map((book, position) =>
          position === index ? { ...book, title: `改名-${name}` } : book,
        );
        edit(baseBooks[index].title, `改名-${name}`);
        submit();
        equal(saved(), expected, `Full snapshot in ${name}`);
        equal(memory(), expected, `Memory in ${name}`);
        assert(
          control(`[data-filter=${name}]`).getAttribute("aria-pressed") ===
            "true",
          "Active filter unchanged",
        );
      }
    });
    await test("旧 fixture 重复、长名与扩展字段不批量改写", [6], async () => {
      const legacy = [
        { title: "重复", read: true, extra: { note: "保留" } },
        { title: "重复", read: false },
        { title: "历".repeat(100), read: false },
        { title: "  历史空白  ", read: true },
      ];
      await openProduct(legacy);
      unchanged(legacy);
      const rows = productDocument.querySelectorAll(".book-item");
      rows[1].querySelector("[data-edit-index]").click();
      fillDraft("第二条改名");
      submit();
      const expected = legacy.map((book, index) =>
        index === 1 ? { ...book, title: "第二条改名" } : book,
      );
      equal(saved(), expected, "Duplicate title does not select wrong object");
      await openProduct();
      equal(memory(), expected, "Legacy fixture readable after reload");
    });
    await test("取消、错误后Escape和重新访问丢草稿", [7, 12], async () => {
      await openProduct(baseBooks);
      edit("Dune", "未保存草稿");
      control(".edit-controls .text-button").click();
      unchanged(baseBooks);
      edit("Dune", " ");
      submit();
      key(control(".edit-input"), "Escape");
      unchanged(baseBooks);
      assert(
        !productDocument.querySelector(".edit-form"),
        "Escape exits invalid editor",
      );
      assert(
        productDocument.activeElement.getAttribute("aria-label") ===
          "修改《Dune》书名",
        "Escape focus returns",
      );
      edit("Dune", "页面重访草稿");
      await openProduct();
      unchanged(baseBooks);
      assert(
        !productDocument.querySelector(".edit-form"),
        "Revisit discards editor",
      );
      assert(
        control("#operation-message").textContent === "",
        "No restored success",
      );
    });
    await test(
      "换条、切筛选及再次点击当前筛选只保留一个编辑",
      [8],
      async () => {
        await openProduct(baseBooks);
        edit("Dune", "A草稿");
        edit("长安的荔枝", "B草稿");
        unchanged(baseBooks);
        filter("all");
        assert(
          !productDocument.querySelector(".edit-form"),
          "Same filter discards draft",
        );
        edit("Dune", "C草稿");
        filter("unread");
        assert(
          !productDocument.querySelector(".edit-form"),
          "Other filter discards draft",
        );
        unchanged(baseBooks);
      },
    );
    await test("改名后删除、编辑目标删除不复活", [9], async () => {
      await openProduct(baseBooks);
      edit("Dune", "沙丘");
      submit();
      click("沙丘", ".delete-button");
      const expected = [baseBooks[0], baseBooks[2]];
      equal(saved(), expected, "Renamed target deleted");
      await openProduct();
      equal(memory(), expected, "Delete survives revisit");
      edit("长安的荔枝", "删除中草稿");
      const stale = control(".edit-form");
      click("长安的荔枝", ".delete-button");
      stale.dispatchEvent(
        new productWindow.Event("submit", { cancelable: true }),
      );
      equal(saved(), [baseBooks[2]], "Stale target cannot resurrect");
      await openProduct();
      equal(memory(), [baseBooks[2]], "Edited delete survives revisit");
    });
    await test("删除其他书和标记替换后草稿目标关联稳定", [9, 10], async () => {
      await openProduct(baseBooks);
      edit("Dune", "唯一目标");
      click("长安的荔枝", ".delete-button");
      equal(
        control(".edit-input").value,
        "唯一目标",
        "Other delete keeps draft",
      );
      equal(saved(), baseBooks.slice(1), "Delete never writes draft");
      click("Dune", "input[type=checkbox]");
      equal(
        control(".edit-input").value,
        "唯一目标",
        "Read replacement keeps draft",
      );
      submit();
      equal(
        saved(),
        [{ title: "唯一目标", read: false }, baseBooks[2]],
        "Rebound object receives title",
      );
      click("唯一目标", ".delete-button");
      click(baseBooks[2].title, ".delete-button");
      assert(!control("#empty-state").hidden, "Empty state visible");
      equal(saved(), [], "All deleted");
    });
    await test("新增失败保留草稿、成功丢草稿并切全部", [10], async () => {
      await openProduct(baseBooks);
      filter("read");
      edit("Dune", "保留草稿");
      add(" ");
      equal(
        control(".edit-input").value,
        "保留草稿",
        "Empty add preserves draft",
      );
      add("dune");
      equal(
        control(".edit-input").value,
        "保留草稿",
        "Duplicate add preserves draft",
      );
      unchanged(baseBooks);
      const restore = failure();
      add("新增书");
      unchanged(baseBooks);
      equal(
        control(".edit-input").value,
        "保留草稿",
        "Failed write add preserves draft",
      );
      restore();
      add("新增书");
      equal(
        saved(),
        [...baseBooks, { title: "新增书", read: false }],
        "Successful add excludes draft",
      );
      assert(
        !productDocument.querySelector(".edit-form"),
        "Successful add exits editor",
      );
      assert(
        control("[data-filter=all]").getAttribute("aria-pressed") === "true",
        "Add returns to all",
      );
    });
    await test("标记保留/移出筛选协调与过滤位置正确", [10], async () => {
      await openProduct(baseBooks);
      filter("unread");
      edit("长安的荔枝", "不保存草稿");
      click("也许你该找个人聊聊", "input[type=checkbox]");
      equal(
        control(".edit-input").value,
        "不保存草稿",
        "Other read toggle keeps draft",
      );
      click("长安的荔枝", "input[type=checkbox]");
      assert(
        !productDocument.querySelector(".edit-form"),
        "Target leaving filter exits edit",
      );
      equal(
        saved(),
        baseBooks.map((book) => ({ ...book, read: true })),
        "Only read flags change",
      );
      assert(
        productDocument.activeElement === control("[data-filter=unread]"),
        "Focus returns to current filter",
      );
      assert(!control("#empty-state").hidden, "Unread empty state correct");
    });
    await test(
      "真实Storage写异常：Quota和Security均保留全快照，可恢复重试",
      [13],
      async () => {
        for (const name of ["QuotaExceededError", "SecurityError"]) {
          await openProduct(baseBooks);
          edit("Dune", "故障恢复书名");
          const restore = failure(name);
          submit();
          unchanged(baseBooks);
          errorState("未能保存，原书名未改变。请重试或取消。", "故障恢复书名");
          restore();
          submit();
          const expected = baseBooks.map((book, index) =>
            index === 1 ? { ...book, title: "故障恢复书名" } : book,
          );
          equal(saved(), expected, "Retry commits complete candidate");
          await openProduct();
          equal(memory(), expected, "Actual storage retained after revisit");
        }
      },
    );
    await test(
      "保存失败后Escape、标记失败、删除失败不污染后续写入",
      [9, 10, 12, 13],
      async () => {
        await openProduct(baseBooks);
        edit("Dune", "失败草稿");
        const restore = failure();
        submit();
        key(control(".edit-input"), "Escape");
        unchanged(baseBooks);
        edit("Dune", "另外草稿");
        click("Dune", "input[type=checkbox]");
        assert(
          row("Dune").querySelector("input[type=checkbox]").checked,
          "Failed checkbox rolls back display",
        );
        click("长安的荔枝", ".delete-button");
        unchanged(baseBooks);
        equal(
          control(".edit-input").value,
          "另外草稿",
          "Failure keeps active draft",
        );
        restore();
        click("长安的荔枝", ".delete-button");
        equal(
          saved(),
          baseBooks.slice(1),
          "Other write does not leak failed draft",
        );
        submit();
        equal(
          saved(),
          [{ title: "另外草稿", read: true }, baseBooks[2]],
          "Retry after delete still targets same record",
        );
      },
    );
    await test(
      "组合输入事件门控与Safari229，不等同系统IME实测",
      [12],
      async () => {
        await openProduct(baseBooks);
        let input = edit("Dune", "中文候选");
        input.dispatchEvent(
          new productWindow.CompositionEvent("compositionstart", {
            bubbles: true,
            data: "中",
          }),
        );
        assert(
          key(input, "Enter").defaultPrevented,
          "Composing Enter suppresses default submit",
        );
        key(input, "Escape");
        submit();
        unchanged(baseBooks);
        assert(
          Boolean(productDocument.querySelector(".edit-form")),
          "Composing Escape and submit preserve editor",
        );
        input.dispatchEvent(
          new productWindow.CompositionEvent("compositionend", {
            bubbles: true,
            data: "中文候选",
          }),
        );
        assert(
          key(input, "Enter", { isComposing: true }).defaultPrevented,
          "isComposing guards end-order variation",
        );
        assert(
          key(input, "Enter", { keyCode: 229 }).defaultPrevented,
          "229 guards candidate confirmation",
        );
        unchanged(baseBooks);
        fillDraft("中文输入完成");
        submit();
        equal(
          saved()[1],
          { title: "中文输入完成", read: true },
          "Explicit save persists complete composition text",
        );
        input = edit("中文输入完成");
        key(input, "Escape", { keyCode: 229 });
        assert(
          Boolean(productDocument.querySelector(".edit-form")),
          "229 Escape does not cancel candidate",
        );
        key(input, "Escape");
        assert(
          !productDocument.querySelector(".edit-form"),
          "Non-composing Escape cancels",
        );
      },
    );
    await test("可访问名称、错误关联、原生表单与焦点语义", [12], async () => {
      await openProduct(baseBooks);
      const input = edit("Dune", " ");
      const label = productDocument.querySelector(`label[for='${input.id}']`);
      assert(label?.textContent === "修改书名", "Explicit accessible label");
      for (const id of input.getAttribute("aria-describedby").split(" ")) {
        assert(
          Boolean(productDocument.getElementById(id)),
          "Description target exists",
        );
      }
      assert(
        control(".edit-error").getAttribute("role") === "alert",
        "Errors announced as alerts",
      );
      assert(
        control("#operation-message").getAttribute("role") === "status",
        "Status feedback semantics",
      );
      equal(
        [...control(".edit-form").querySelectorAll("input,button")].map(
          (element) => element.tagName,
        ),
        ["INPUT", "BUTTON", "BUTTON"],
        "Native tab order input/save/cancel",
      );
      submit();
      errorState("请填写书名，不能只输入空格。", " ");
      control(".edit-controls .text-button").click();
      assert(
        productDocument.activeElement.getAttribute("aria-label") ===
          "修改《Dune》书名",
        "Cancel focus live and named",
      );
    });
    await test("320/1280长名称编辑无横向溢出且操作44px", [11], async () => {
      for (const width of [320, 1280]) {
        const title = "长书名".repeat(26);
        await openProduct([{ title, read: true }], width);
        assert(
          productDocument.documentElement.scrollWidth <= width,
          `Display fits ${width}`,
        );
        edit(title, "更长草稿".repeat(21));
        submit();
        await new Promise((resolve) =>
          productWindow.requestAnimationFrame(resolve),
        );
        assert(
          productDocument.documentElement.scrollWidth <= width,
          `Error/editor fits ${width}`,
        );
        for (const button of control(".edit-controls").querySelectorAll(
          "button",
        )) {
          const rectangle = button.getBoundingClientRect();
          assert(rectangle.height >= 44, "Edit action min-height 44px");
          assert(
            rectangle.left >= 0 && rectangle.right <= width,
            "Edit button within viewport",
          );
        }
        assert(
          control(".edit-input").getBoundingClientRect().right <= width,
          "Input within viewport",
        );
        measurements.push({
          viewport: width,
          documentWidth: productDocument.documentElement.scrollWidth,
          inputRight: control(".edit-input").getBoundingClientRect().right,
          buttonHeights: [
            ...control(".edit-controls").querySelectorAll("button"),
          ].map((button) => button.getBoundingClientRect().height),
        });
      }
    });
    await test("历史损坏数据加载不触发覆写且空状态正确", [6, 10], async () => {
      for (const contents of [
        "not json",
        JSON.stringify({ title: "不是数组" }),
        JSON.stringify([
          null,
          { title: 1, read: false },
          { title: "有效", read: true },
        ]),
      ]) {
        localStorage.setItem(storageKey, contents);
        await openProduct();
        assert(
          localStorage.getItem(storageKey) === contents,
          "Loading never overwrites historical bytes",
        );
        const expected = contents.includes("有效")
          ? [{ title: "有效", read: true }]
          : [];
        equal(memory(), expected, "Existing loader compatibility unchanged");
      }
    });
  } finally {
    if (previous === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, previous);
  }
  const passed = records.filter((record) => record.passed).length;
  result.textContent = `产品集成测试：${passed}/${records.length} 通过；页面错误 ${browserErrors.length}`;
  details.textContent = JSON.stringify(
    {
      records,
      browserErrors,
      measurements,
      scope:
        "真实浏览器/产品DOM/实际Storage边界；组合事件合成，未操作系统IME或屏幕阅读器",
    },
    null,
    2,
  );
  const download = document.querySelector("#download");
  download.hidden = false;
  download.addEventListener("click", () => {
    const file = new Blob([details.textContent], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-integration-71.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

document.querySelector("#run").addEventListener("click", () => {
  document.querySelector("#run").disabled = true;
  run().catch((error) => {
    result.textContent = `夹具执行失败：${error.message}`;
  });
});
