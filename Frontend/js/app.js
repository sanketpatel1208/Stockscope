const API_URL = "https://stockscope-backend-3pip.onrender.com/api";

var historyChart = null;


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

function getElement(id) {
    return document.getElementById(id);
}


function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }

    var number = Number(value);

    if (isNaN(number)) {
        return value;
    }

    return "₹" + number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}
function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }

    var number = Number(value);

    if (isNaN(number)) {
        return value;
    }

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) {
        return "N/A";
    }

    var date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN");
}


function showError(element, message) {
    if (!element) {
        return;
    }

    element.innerHTML =
        '<div class="error-message">' +
        message +
        "</div>";
}


function showSuccess(element, message) {
    if (!element) {
        return;
    }

    element.innerHTML =
        '<div class="success-message">' +
        message +
        "</div>";
}


function createMetric(label, value) {
    return (
        '<div class="metric">' +
        '<div class="metric-label">' +
        label +
        "</div>" +
        '<div class="metric-value">' +
        value +
        "</div>" +
        "</div>"
    );
}


/* ============================================================
   DASHBOARD
   ============================================================ */

async function loadDashboardStats() {
    var stockCountElement = getElement("stockCount");

    try {
        var response = await fetch(API_URL + "/stocks");

        if (!response.ok) {
            throw new Error("Unable to load stock data");
        }

        var data = await response.json();

        if (data.stocks && Array.isArray(data.stocks)) {
            if (stockCountElement) {
                stockCountElement.textContent = data.count;
            }
        }

    } catch (error) {
        console.error("Dashboard error:", error);

        if (stockCountElement) {
            stockCountElement.textContent = "0";
        }
    }

    loadWatchlistCount();
}


async function loadWatchlistCount() {
    var element = getElement("watchlistCount");

    if (!element) {
        return;
    }

    try {
        var response = await fetch(API_URL + "/watchlist");

        if (!response.ok) {
            throw new Error("Watchlist request failed");
        }

        var data = await response.json();

        element.textContent = data.count || 0;

    } catch (error) {
        console.error("Watchlist count error:", error);

        element.textContent = "0";
    }
}


/* ============================================================
   SEARCH STOCK
   ============================================================ */

async function searchStock() {
    var input = getElement("searchSymbol");
    var result = getElement("searchResult");

    if (!input || !result) {
        console.error("Search elements not found");
        return;
    }

    var symbol = input.value.trim().toUpperCase();

    if (symbol === "") {
        showError(
            result,
            "Please enter a stock symbol."
        );
        return;
    }

    result.innerHTML =
        '<div class="loading-message">Searching for ' +
        symbol +
        "...</div>";

    try {

        var url =
            API_URL +
            "/search?symbol=" +
            encodeURIComponent(symbol);

        var response = await fetch(url);

        if (!response.ok) {
            throw new Error("Stock not found");
        }

        var stock = await response.json();

        console.log("Search response:", stock);

        result.innerHTML =
            '<div class="stock-card">' +

            '<div class="stock-card-header">' +

            '<div>' +

            '<div class="stock-symbol">' +
            (stock.symbol || symbol) +
            "</div>" +

            '<div class="stock-sector">' +
            (stock.sector || "Sector unavailable") +
            "</div>" +

            "</div>" +

            '<button class="btn-primary" onclick="quickAddToWatchlist(\'' +
            stock.symbol +
            "')\">" +
            "Add to Watchlist" +
            "</button>" +

            "</div>" +

            '<div class="stock-company">' +
            (stock.company_name || "Company name unavailable") +
            "</div>" +

            '<div class="stock-metrics">' +

            createMetric(
                "Price",
                formatCurrency(stock.current_price)
            ) +

            createMetric(
                "Market Cap",
                formatNumber(stock.market_cap)
            ) +

            createMetric(
                "P/E Ratio",
                formatNumber(stock.pe_ratio)
            ) +

            createMetric(
                "ROE",
                formatNumber(stock.roe) + "%"
            ) +

            createMetric(
                "ROCE",
                formatNumber(stock.roce) + "%"
            ) +

            createMetric(
                "Debt",
                formatNumber(stock.debt)
            ) +

            "</div>" +

            '<div class="stock-metrics">' +

            createMetric(
                "Book Value",
                formatNumber(stock.book_value)
            ) +

            createMetric(
                "EPS",
                formatNumber(stock.eps)
            ) +

            createMetric(
                "Dividend Yield",
                formatNumber(stock.dividend_yield) + "%"
            ) +

            createMetric(
                "Price / Sales",
                formatNumber(stock.price_to_sales)
            ) +

            createMetric(
                "Sales Growth",
                formatNumber(stock.sales_growth) + "%"
            ) +

            createMetric(
                "Profit Growth",
                formatNumber(stock.profit_growth) + "%"
            ) +

            "</div>" +

            '<div class="stock-source">' +
            "Fundamentals as of: " +
            formatDate(stock.as_of_date) +
            "</div>" +

            "</div>";

    } catch (error) {

        console.error("Search error:", error);

        showError(
            result,
            "Stock not found or server is unavailable."
        );
    }
}


/* ============================================================
   WATCHLIST - QUICK ADD
   ============================================================ */

async function quickAddToWatchlist(symbol) {

    try {

        var response = await fetch(
            API_URL + "/watchlist/add",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    symbol: symbol
                })
            }
        );

        var data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Could not add stock"
            );
        }

        alert(
            symbol +
            " added to watchlist."
        );

        loadWatchlist();
        loadWatchlistCount();

    } catch (error) {

        console.error(
            "Add watchlist error:",
            error
        );

        alert(
            error.message ||
            "Could not add " +
            symbol +
            " to watchlist."
        );
    }
}


/* ============================================================
   WATCHLIST - LOAD
   ============================================================ */

function getWatchlistChange(stock) {
    var candidates = [
        stock.change_percent,
        stock.change_pct,
        stock.percent_change,
        stock.day_change_percent,
        stock.daily_change_percent,
        stock.changePercentage
    ];

    for (var i = 0; i < candidates.length; i++) {
        if (
            candidates[i] !== null &&
            candidates[i] !== undefined &&
            candidates[i] !== "" &&
            !isNaN(Number(candidates[i]))
        ) {
            return Number(candidates[i]);
        }
    }

    // If the API provides current and previous close, calculate the daily move.
    var current = Number(stock.current_price);
    var previous = Number(
        stock.previous_close !== undefined
            ? stock.previous_close
            : stock.prev_close
    );

    if (
        isFinite(current) &&
        isFinite(previous) &&
        previous !== 0
    ) {
        return ((current - previous) / previous) * 100;
    }

    return null;
}

function getWatchlistChangeMarkup(stock) {
    var change = getWatchlistChange(stock);

    if (change === null) {
        return '<span class="watchlist-change watchlist-change-neutral">—</span>';
    }

    var className =
        change > 0
            ? "watchlist-change-positive"
            : change < 0
                ? "watchlist-change-negative"
                : "watchlist-change-neutral";

    var sign = change > 0 ? "+" : "";
    var arrow = change > 0 ? "▲" : change < 0 ? "▼" : "•";

    return (
        '<span class="watchlist-change ' +
        className +
        '">' +
        arrow +
        " " +
        sign +
        change.toFixed(2) +
        "%" +
        "</span>"
    );
}

function getWatchlistMetricMarkup(label, value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    return (
        '<div class="watchlist-mini-metric">' +
        '<span class="watchlist-mini-label">' +
        label +
        "</span>" +
        '<span class="watchlist-mini-value">' +
        value +
        "</span>" +
        "</div>"
    );
}

async function loadWatchlist() {

    var container =
        getElement("watchlistContainer");

    if (!container) {
        return;
    }

    container.innerHTML =
        '<div class="loading-message">Loading watchlist...</div>';

    try {

        var response =
            await fetch(
                API_URL + "/watchlist"
            );

        if (!response.ok) {
            throw new Error(
                "Watchlist request failed"
            );
        }

        var data =
            await response.json();

        var stocks =
            data.watchlist || [];

        if (stocks.length === 0) {

            container.innerHTML =
                '<div class="empty-message">' +
                "Your watchlist is empty." +
                "</div>";

            loadWatchlistCount();

            return;
        }

        container.innerHTML = "";

        stocks.forEach(function (stock) {

            var symbol = stock.symbol || "N/A";
            var company = stock.company_name || "Company";
            var price = formatCurrency(stock.current_price);
            var changeMarkup = getWatchlistChangeMarkup(stock);

            var metrics = "";

            metrics += getWatchlistMetricMarkup(
                "P/E",
                formatNumber(stock.pe_ratio)
            );

            metrics += getWatchlistMetricMarkup(
                "ROE",
                stock.roe === null ||
                stock.roe === undefined ||
                stock.roe === ""
                    ? ""
                    : formatNumber(stock.roe) + "%"
            );

            metrics += getWatchlistMetricMarkup(
                "Mkt Cap",
                formatNumber(stock.market_cap)
            );

            var card =
                '<article class="watchlist-card">' +

                '<div class="watchlist-card-top">' +

                '<div class="watchlist-identity">' +

                '<div class="watchlist-symbol-row">' +

                '<span class="stock-symbol">' +
                symbol +
                "</span>" +

                changeMarkup +

                "</div>" +

                '<div class="stock-sector">' +
                company +
                "</div>" +

                (stock.sector
                    ? '<div class="watchlist-sector">' +
                      stock.sector +
                      "</div>"
                    : "") +

                "</div>" +

                '<button class="btn-danger watchlist-remove" ' +
                'type="button" ' +
                'onclick="removeFromWatchlist(\'' +
                symbol.replace(/'/g, "\\'") +
                "')\">" +
                "Remove" +
                "</button>" +

                "</div>" +

                '<div class="watchlist-quote">' +

                '<div class="watchlist-price">' +
                price +
                "</div>" +

                '<div class="watchlist-price-label">LAST PRICE</div>' +

                "</div>" +

                (metrics
                    ? '<div class="watchlist-mini-metrics">' +
                      metrics +
                      "</div>"
                    : "") +

                "</article>";

            container.insertAdjacentHTML(
                "beforeend",
                card
            );
        });

        loadWatchlistCount();

    } catch (error) {

        console.error(
            "Load watchlist error:",
            error
        );

        showError(
            container,
            "Could not load watchlist."
        );
    }
}


/* ============================================================
   WATCHLIST - ADD FROM SECTION
   ============================================================ */

async function addToWatchlist() {

    var input =
        getElement("watchlistSymbol");

    var result =
        getElement("watchlistResult");

    if (!input) {
        return;
    }

    var symbol =
        input.value.trim().toUpperCase();

    if (symbol === "") {

        if (result) {
            showError(
                result,
                "Please enter a stock symbol."
            );
        }

        return;
    }

    if (result) {

        result.innerHTML =
            '<div class="loading-message">Adding ' +
            symbol +
            "...</div>";
    }

    try {

        var response =
            await fetch(
                API_URL + "/watchlist/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        symbol: symbol
                    })
                }
            );

        var data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to add stock"
            );
        }

        if (result) {

            showSuccess(
                result,
                symbol +
                " added to your watchlist."
            );
        }

        input.value = "";

        loadWatchlist();
        loadWatchlistCount();

    } catch (error) {

        console.error(
            "Add watchlist error:",
            error
        );

        if (result) {

            showError(
                result,
                error.message ||
                "Unable to add stock to watchlist."
            );
        }
    }
}


/* ============================================================
   WATCHLIST - REMOVE
   ============================================================ */

async function removeFromWatchlist(symbol) {

    if (
        !confirm(
            "Remove " +
            symbol +
            " from watchlist?"
        )
    ) {
        return;
    }

    try {

        var response =
            await fetch(
                API_URL +
                "/watchlist/remove?symbol=" +
                encodeURIComponent(symbol),
                {
                    method: "DELETE"
                }
            );

        var data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Delete failed"
            );
        }

        loadWatchlist();
        loadWatchlistCount();

    } catch (error) {

        console.error(
            "Remove watchlist error:",
            error
        );

        alert(
            error.message ||
            "Could not remove " +
            symbol +
            " from watchlist."
        );
    }
}


/* ============================================================
   STOCK SCREENER
   ============================================================ */

async function runScreener() {

    var maxPEElement =
        getElement("maxPE");

    var minROEElement =
        getElement("minROE");

    var maxDebtElement =
        getElement("maxDebt");

    var result =
        getElement("screenerResult");

    if (
        !maxPEElement ||
        !minROEElement ||
        !maxDebtElement ||
        !result
    ) {
        console.error(
            "Screener elements not found"
        );
        return;
    }

    var maxPE =
        maxPEElement.value;

    var minROE =
        minROEElement.value;

    var maxDebt =
        maxDebtElement.value;

    result.innerHTML =
        '<div class="loading-message">Running stock screener...</div>';

    try {

        var url =
            API_URL +
            "/screener?max_pe=" +
            encodeURIComponent(maxPE) +
            "&min_roe=" +
            encodeURIComponent(minROE) +
            "&max_debt=" +
            encodeURIComponent(maxDebt);

        var response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Screener request failed"
            );
        }

        var data =
            await response.json();

        console.log(
            "Screener response:",
            data
        );

        var stocks =
            data.stocks || [];

        if (stocks.length === 0) {

            result.innerHTML =
                '<div class="empty-message">' +
                "No stocks satisfy all selected criteria." +
                "</div>";

            return;
        }

        var html =
            '<div class="screener-table-wrapper">' +

            '<table class="screener-table">' +

            "<thead>" +

            "<tr>" +

            "<th>Symbol</th>" +
            "<th>Company</th>" +
            "<th>Sector</th>" +
            "<th>P/E</th>" +
            "<th>ROE</th>" +
            "<th>Debt</th>" +

            "</tr>" +

            "</thead>" +

            "<tbody>";

        stocks.forEach(function (stock) {

            html +=
                "<tr>" +

                "<td>" +
                (stock.symbol || "N/A") +
                "</td>" +

                "<td>" +
                (stock.company_name || "N/A") +
                "</td>" +

                "<td>" +
                (stock.sector || "N/A") +
                "</td>" +

                "<td>" +
                formatNumber(stock.pe_ratio) +
                "</td>" +

                "<td>" +
                formatNumber(stock.roe) +
                "%" +
                "</td>" +

                "<td>" +
                formatNumber(stock.debt) +
                "</td>" +

                "</tr>";
        });

        html +=
            "</tbody>" +
            "</table>" +
            "</div>" +

            '<div class="screener-count">' +
            "Stocks passing criteria: " +
            data.count +
            "</div>";

        result.innerHTML =
            html;

    } catch (error) {

        console.error(
            "Screener error:",
            error
        );

        showError(
            result,
            "Could not run screener. Please check whether the backend is running."
        );
    }
}


/* ============================================================
   COMPARE STOCKS
   ============================================================ */

async function compareStocks() {

    var input =
        getElement("compareSymbols");

    var result =
        getElement("compareResult");

    if (!input || !result) {

        console.error(
            "Compare elements not found"
        );

        return;
    }

    var symbolsText =
        input.value.trim();

    if (symbolsText === "") {

        showError(
            result,
            "Enter at least two stock symbols."
        );

        return;
    }

    var symbols =
        symbolsText
            .split(",")
            .map(function (symbol) {
                return symbol
                    .trim()
                    .toUpperCase();
            })
            .filter(function (symbol) {
                return symbol !== "";
            });

    if (symbols.length < 2) {

        showError(
            result,
            "Please enter at least two symbols separated by commas."
        );

        return;
    }

    if (symbols.length > 4) {

        showError(
            result,
            "Maximum 4 stocks can be compared."
        );

        return;
    }

    result.innerHTML =
        '<div class="loading-message">Comparing stocks...</div>';

    try {

        /*
         IMPORTANT:
         Flask app.py expects:
         ?symbols=ABB,RELIANCE,TCS
        */

        var query =
            "symbols=" +
            encodeURIComponent(
                symbols.join(",")
            );

        var response =
            await fetch(
                API_URL +
                "/compare?" +
                query
            );

        if (!response.ok) {

            var errorData =
                await response.json();

            throw new Error(
                errorData.error ||
                "Compare request failed"
            );
        }

        var data =
            await response.json();

        console.log(
            "Compare response:",
            data
        );

        var stocks =
            data.stocks || [];

        if (stocks.length === 0) {

            showError(
                result,
                "No comparison data found."
            );

            return;
        }

        var html =
            '<div class="compare-table-wrapper">' +

            '<table class="compare-table">' +

            "<thead>" +

            "<tr>" +

            "<th>Metric</th>";

        stocks.forEach(function (stock) {

            html +=
                "<th>" +
                (stock.symbol || "N/A") +
                "</th>";
        });

        html +=
            "</tr>" +
            "</thead>" +
            "<tbody>";

        html += createComparisonRow(
            "Company",
            stocks,
            "company_name",
            false,
            false
        );

        html += createComparisonRow(
            "Sector",
            stocks,
            "sector",
            false,
            false
        );

        html += createComparisonRow(
            "Price",
            stocks,
            "current_price",
            true,
            false
        );

        html += createComparisonRow(
            "Market Cap",
            stocks,
            "market_cap",
            false,
            false
        );

        html += createComparisonRow(
            "P/E Ratio",
            stocks,
            "pe_ratio",
            false,
            false
        );

        html += createComparisonRow(
            "Book Value",
            stocks,
            "book_value",
            false,
            false
        );

        html += createComparisonRow(
            "EPS",
            stocks,
            "eps",
            false,
            false
        );

        html += createComparisonRow(
            "ROE",
            stocks,
            "roe",
            false,
            true
        );

        html += createComparisonRow(
            "ROCE",
            stocks,
            "roce",
            false,
            true
        );

        html += createComparisonRow(
            "Debt",
            stocks,
            "debt",
            false,
            false
        );

        html += createComparisonRow(
            "Dividend Yield",
            stocks,
            "dividend_yield",
            false,
            true
        );

        html += createComparisonRow(
            "Price to Sales",
            stocks,
            "price_to_sales",
            false,
            false
        );

        html += createComparisonRow(
            "Sales Growth",
            stocks,
            "sales_growth",
            false,
            true
        );

        html += createComparisonRow(
            "Profit Growth",
            stocks,
            "profit_growth",
            false,
            true
        );

        html +=
            "</tbody>" +
            "</table>" +
            "</div>";

        result.innerHTML =
            html;

    } catch (error) {

        console.error(
            "Compare error:",
            error
        );

        showError(
            result,
            error.message ||
            "Could not compare stocks."
        );
    }
}


/* ============================================================
   COMPARISON ROW
   ============================================================ */

function createComparisonRow(
    label,
    stocks,
    property,
    currency,
    percentage
) {

    var html =
        "<tr>" +
        "<th>" +
        label +
        "</th>";

    stocks.forEach(function (stock) {

        var value =
            stock[property];

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            value = "N/A";

        } else if (currency) {

            value =
                formatCurrency(value);

        } else if (percentage) {

            value =
                formatNumber(value) +
                "%";

        } else if (
            property !== "company_name" &&
            property !== "sector"
        ) {

            value =
                formatNumber(value);
        }

        html +=
            "<td>" +
            value +
            "</td>";
    });

    html +=
        "</tr>";

    return html;
}


/* ============================================================
   HISTORICAL PRICE DATA
   ============================================================ */

async function loadHistory(period) {

    var symbolInput =
        getElement("historySymbol");

    var title =
        getElement("historyTitle");

    var status =
        getElement("historyStatus");

    var chartCanvas =
        getElement("priceChart");

    if (
        !symbolInput ||
        !title ||
        !status ||
        !chartCanvas
    ) {

        console.error(
            "History elements not found"
        );

        return;
    }

    var symbol =
        symbolInput.value
            .trim()
            .toUpperCase();

    if (symbol === "") {

        showError(
            status,
            "Please enter a stock symbol."
        );

        return;
    }

    title.textContent =
        symbol +
        " Price History - " +
        period;

    status.innerHTML =
        '<div class="loading-message">Loading historical data...</div>';

    try {

        /*
         Flask app.py expects:
         /api/history?symbol=ABB&period=1Y
        */

        var url =
            API_URL +
            "/history?symbol=" +
            encodeURIComponent(symbol) +
            "&period=" +
            encodeURIComponent(period);

        var response =
            await fetch(url);

        if (!response.ok) {

            var errorData =
                await response.json();

            throw new Error(
                errorData.error ||
                "Historical data request failed"
            );
        }

        var data =
            await response.json();

        console.log(
            "History response:",
            data
        );

        var history =
            data.history || [];

        if (history.length === 0) {

            showError(
                status,
                "No historical price data found."
            );

            return;
        }

        var labels = [];
        var prices = [];

        history.forEach(function (item) {

            if (
                item.trade_date !== null &&
                item.close_price !== null
            ) {

                labels.push(
                    formatDate(
                        item.trade_date
                    )
                );

                prices.push(
                    Number(
                        item.close_price
                    )
                );
            }
        });

        if (labels.length === 0) {

            throw new Error(
                "No valid chart data received"
            );
        }

        if (historyChart !== null) {

            historyChart.destroy();

            historyChart = null;
        }

        historyChart =
            new Chart(
                chartCanvas,
                {
                    type: "line",

                    data: {

                        labels: labels,

                        datasets: [
                            {
                                label:
                                    symbol +
                                    " Closing Price",

                                data: prices,

                                borderWidth: 2,

                                pointRadius: 0,

                                tension: 0.2,

                                fill: false
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        interaction: {
                            mode: "index",
                            intersect: false
                        },

                        plugins: {

                            legend: {
                                display: true
                            }
                        },

                        scales: {

                            x: {

                                ticks: {
                                    maxTicksLimit: 10
                                }
                            },

                            y: {
                                beginAtZero: false
                            }
                        }
                    }
                }
            );

        status.innerHTML =
            '<div class="success-message">' +
            "Loaded " +
            labels.length +
            " historical records." +
            "</div>";

    } catch (error) {

        console.error(
            "History error:",
            error
        );

        showError(
            status,
            error.message ||
            "Could not load historical price data."
        );
    }
}


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "StockScope app.js loaded successfully."
        );

        loadDashboardStats();

        loadWatchlist();


        /* ----------------------------------------------------
           SEARCH ENTER KEY
           ---------------------------------------------------- */

        var searchInput =
            getElement("searchSymbol");

        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        searchStock();
                    }
                }
            );
        }


        /* ----------------------------------------------------
           WATCHLIST ENTER KEY
           ---------------------------------------------------- */

        var watchlistInput =
            getElement("watchlistSymbol");

        if (watchlistInput) {

            watchlistInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        addToWatchlist();
                    }
                }
            );
        }


        /* ----------------------------------------------------
           COMPARE ENTER KEY
           ---------------------------------------------------- */

        var compareInput =
            getElement("compareSymbols");

        if (compareInput) {

            compareInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        compareStocks();
                    }
                }
            );
        }


        /* ----------------------------------------------------
           HISTORY ENTER KEY
           ---------------------------------------------------- */

        var historyInput =
            getElement("historySymbol");

        if (historyInput) {

            historyInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        loadHistory("1Y");
                    }
                }
            );
        }

    }
);
