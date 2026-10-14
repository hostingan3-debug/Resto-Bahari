// Form pemesanan Resto Bahari
(function () {
  var form = document.getElementById("form-pemesanan");
  var totalEl = document.getElementById("total");
  var errorEl = document.getElementById("form-error");
  var resultEl = document.getElementById("order-result");
  var cardBox = document.getElementById("card-box");
  var cardInput = document.getElementById("kartu");
  var dateInput = document.getElementById("tanggal");

  // Tanggal booking tidak boleh sebelum hari ini
  var now = new Date();
  var today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  dateInput.min = today;

  function updateTotal() {
    var total = 0;
    form.querySelectorAll(".item-row").forEach(function (row) {
      var cb = row.querySelector('input[type="checkbox"]');
      var qty = row.querySelector(".qty");
      if (cb.checked) {
        total += Number(cb.dataset.price) * (parseInt(qty.value, 10) || 0);
      }
    });
    totalEl.textContent = "$" + total;
    return total;
  }

  // Checkbox menu mengaktifkan kolom jumlah
  form.querySelectorAll(".item-row").forEach(function (row) {
    var cb = row.querySelector('input[type="checkbox"]');
    var qty = row.querySelector(".qty");
    cb.addEventListener("change", function () {
      qty.disabled = !cb.checked;
      if (cb.checked && !qty.value) qty.value = 1;
      updateTotal();
    });
    qty.addEventListener("input", updateTotal);
  });

  // Nomor kartu hanya muncul jika memilih kartu debit/kredit
  form.querySelectorAll('input[name="pembayaran"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var isCard = radio.value === "Kartu Debit/Kredit" && radio.checked;
      cardBox.hidden = !isCard;
      cardInput.required = isCard;
      if (!isCard) cardInput.value = "";
    });
  });

  // Format nomor kartu: 1234 5678 9012 3456
  cardInput.addEventListener("input", function () {
    var digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
    cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    resultEl.hidden = true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var nama = form.nama.value.trim();
    var hp = form.hp.value.trim();
    var tanggal = form.tanggal.value;
    var payment = form.querySelector('input[name="pembayaran"]:checked');

    if (!nama) return showError("Nama lengkap wajib diisi.");
    if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(hp.replace(/[\s-]/g, "")))
      return showError("No. HP tidak valid. Contoh: 081234567890.");
    if (!tanggal) return showError("Tanggal booking wajib diisi.");
    if (tanggal < today) return showError("Tanggal booking tidak boleh sebelum hari ini.");

    var items = [];
    var invalidQty = false;
    form.querySelectorAll(".item-row").forEach(function (row) {
      var cb = row.querySelector('input[type="checkbox"]');
      var qty = parseInt(row.querySelector(".qty").value, 10);
      if (cb.checked) {
        if (!qty || qty < 1) invalidQty = true;
        items.push({ name: cb.value, qty: qty, price: Number(cb.dataset.price) });
      }
    });
    if (!items.length) return showError("Pilih minimal satu menu.");
    if (invalidQty) return showError("Jumlah item minimal 1.");

    if (!payment) return showError("Pilih metode pembayaran.");
    var cardDigits = cardInput.value.replace(/\D/g, "");
    if (payment.value === "Kartu Debit/Kredit" && cardDigits.length < 13)
      return showError("Nomor kartu tidak valid (13-16 digit).");

    var payText = escapeHtml(payment.value);
    if (payment.value === "Kartu Debit/Kredit") {
      payText += " (**** " + cardDigits.slice(-4) + ")";
    }

    var list = items
      .map(function (it) {
        return "<li>" + escapeHtml(it.name) + " x " + it.qty + " = $" + it.price * it.qty + "</li>";
      })
      .join("");

    resultEl.innerHTML =
      "<h3>Pesanan berhasil dikirim!</h3>" +
      "<p><strong>Nama:</strong> " + escapeHtml(nama) + "</p>" +
      "<p><strong>No. HP:</strong> " + escapeHtml(hp) + "</p>" +
      "<p><strong>Tanggal Booking:</strong> " + escapeHtml(tanggal) + "</p>" +
      "<p><strong>Pesanan:</strong></p><ul>" + list + "</ul>" +
      "<p><strong>Total:</strong> $" + updateTotal() + "</p>" +
      "<p><strong>Pembayaran:</strong> " + payText + "</p>";
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
