from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_connection


app = Flask(__name__)
CORS(app)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return jsonify({
        "message": "StockScope API is running",
        "status": "success"
    })


# ============================================================
# GET ALL STOCKS
# ============================================================

@app.route("/api/stocks", methods=["GET"])
def get_stocks():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                stock_id,
                symbol,
                company_name,
                sector,
                industry
            FROM STOCKS
            ORDER BY symbol
        """)

        stocks = cursor.fetchall()

        return jsonify({
            "count": len(stocks),
            "stocks": stocks
        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# SEARCH STOCK
# ============================================================

@app.route("/api/search", methods=["GET"])
def search_stock():

    symbol = request.args.get("symbol", "").upper().strip()

    if not symbol:
        return jsonify({
            "error": "Stock symbol is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                s.stock_id,
                s.symbol,
                s.company_name,
                s.sector,
                s.industry,

                f.as_of_date,
                f.market_cap,
                f.current_price,
                f.high_price,
                f.low_price,
                f.pe_ratio,
                f.book_value,
                f.dividend_yield,
                f.roce,
                f.roe,
                f.face_value,
                f.price_to_sales,
                f.sales_growth,
                f.sales_growth_3y,
                f.sales_growth_5y,
                f.sales_growth_7y,
                f.sales_growth_10y,
                f.profit_growth,
                f.profit_growth_3y,
                f.profit_growth_5y,
                f.profit_growth_7y,
                f.profit_growth_10y,
                f.eps,
                f.eps_last_year,
                f.debt,
                f.debt_3y_back,
                f.debt_5y_back,
                f.debt_7y_back,
                f.debt_10y_back

            FROM STOCKS s

            LEFT JOIN FUNDAMENTALS_SNAPSHOT f
                ON s.stock_id = f.stock_id

            WHERE s.symbol = %s

            ORDER BY f.as_of_date DESC

            LIMIT 1
        """, (symbol,))

        stock = cursor.fetchone()

        if stock is None:

            return jsonify({
                "error": "Stock not found"
            }), 404

        return jsonify(stock)

    finally:

        cursor.close()
        connection.close()


# ============================================================
# STOCK SCREENER
# ============================================================

@app.route("/api/screener", methods=["GET"])
def screen_stocks():

    max_pe = request.args.get("max_pe", 25, type=float)
    min_roe = request.args.get("min_roe", 15, type=float)
    max_debt = request.args.get("max_debt", 10000, type=float)

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                s.symbol,
                s.company_name,
                s.sector,

                f.current_price,
                f.market_cap,
                f.pe_ratio,
                f.roe,
                f.debt

            FROM STOCKS s

            INNER JOIN FUNDAMENTALS_SNAPSHOT f
                ON s.stock_id = f.stock_id

            WHERE
                f.pe_ratio <= %s
                AND f.roe >= %s
                AND f.debt <= %s

            ORDER BY f.pe_ratio ASC
        """, (
            max_pe,
            min_roe,
            max_debt
        ))

        stocks = cursor.fetchall()

        return jsonify({
            "criteria": {
                "max_pe": max_pe,
                "min_roe": min_roe,
                "max_debt": max_debt
            },
            "count": len(stocks),
            "stocks": stocks
        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# COMPARE STOCKS
# ============================================================

@app.route("/api/compare", methods=["GET"])
def compare_stocks():

    symbols_text = request.args.get("symbols", "")

    if not symbols_text:

        return jsonify({
            "error": "Stock symbols are required"
        }), 400

    symbols = [
        symbol.upper().strip()
        for symbol in symbols_text.split(",")
        if symbol.strip()
    ]

    if len(symbols) < 2:

        return jsonify({
            "error": "Please provide at least 2 stock symbols"
        }), 400

    if len(symbols) > 4:

        return jsonify({
            "error": "Maximum 4 stocks can be compared"
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        placeholders = ",".join(["%s"] * len(symbols))

        query = f"""
            SELECT
                s.symbol,
                s.company_name,
                s.sector,

                f.as_of_date,
                f.current_price,
                f.market_cap,
                f.pe_ratio,
                f.book_value,
                f.dividend_yield,
                f.roce,
                f.roe,
                f.price_to_sales,
                f.sales_growth,
                f.profit_growth,
                f.eps,
                f.debt

            FROM STOCKS s

            LEFT JOIN FUNDAMENTALS_SNAPSHOT f
                ON s.stock_id = f.stock_id

            WHERE s.symbol IN ({placeholders})

            ORDER BY s.symbol
        """

        cursor.execute(query, tuple(symbols))

        stocks = cursor.fetchall()

        return jsonify({
            "count": len(stocks),
            "stocks": stocks
        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# HISTORICAL PRICE DATA
# ============================================================

@app.route("/api/history", methods=["GET"])
def get_history():

    symbol = request.args.get("symbol", "").upper().strip()

    period = request.args.get(
        "period",
        "1Y"
    ).upper()

    if not symbol:

        return jsonify({
            "error": "Stock symbol is required"
        }), 400

    period_days = {
        "1Y": 365,
        "3Y": 1095,
        "5Y": 1825,
        "MAX": None
    }

    if period not in period_days:

        return jsonify({
            "error": "Invalid period. Use 1Y, 3Y, 5Y or MAX."
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # ----------------------------------------------------
        # Find stock
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                stock_id,
                symbol,
                company_name
            FROM STOCKS
            WHERE symbol = %s
        """, (symbol,))

        stock = cursor.fetchone()

        if stock is None:

            return jsonify({
                "error": "Stock not found"
            }), 404


        # ----------------------------------------------------
        # Get historical prices
        # ----------------------------------------------------

        if period_days[period] is None:

            cursor.execute("""
                SELECT
                    trade_date,
                    open_price,
                    high_price,
                    low_price,
                    close_price,
                    adj_close,
                    volume

                FROM PRICE_HISTORY

                WHERE stock_id = %s

                ORDER BY trade_date
            """, (
                stock["stock_id"],
            ))

        else:

            cursor.execute("""
                SELECT
                    trade_date,
                    open_price,
                    high_price,
                    low_price,
                    close_price,
                    adj_close,
                    volume

                FROM PRICE_HISTORY

                WHERE
                    stock_id = %s
                    AND trade_date >= DATE_SUB(
                        CURDATE(),
                        INTERVAL %s DAY
                    )

                ORDER BY trade_date
            """, (
                stock["stock_id"],
                period_days[period]
            ))


        history = cursor.fetchall()


        # ----------------------------------------------------
        # Convert MySQL values to JSON-compatible values
        # ----------------------------------------------------

        for row in history:

            row["trade_date"] = row["trade_date"].isoformat()

            if row["open_price"] is not None:
                row["open_price"] = float(row["open_price"])

            if row["high_price"] is not None:
                row["high_price"] = float(row["high_price"])

            if row["low_price"] is not None:
                row["low_price"] = float(row["low_price"])

            if row["close_price"] is not None:
                row["close_price"] = float(row["close_price"])

            if row["adj_close"] is not None:
                row["adj_close"] = float(row["adj_close"])

            if row["volume"] is not None:
                row["volume"] = int(row["volume"])


        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        return jsonify({

            "symbol": stock["symbol"],

            "company_name": stock["company_name"],

            "period": period,

            "count": len(history),

            "history": history

        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# PERFORMANCE
# ============================================================

@app.route("/api/performance", methods=["GET"])
def get_performance():

    symbol = request.args.get("symbol", "").upper().strip()

    if not symbol:

        return jsonify({
            "error": "Stock symbol is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                s.stock_id,
                s.symbol,
                s.company_name

            FROM STOCKS s

            WHERE s.symbol = %s
        """, (symbol,))

        stock = cursor.fetchone()

        if stock is None:

            return jsonify({
                "error": "Stock not found"
            }), 404


        cursor.execute("""
            SELECT
                trade_date,
                close_price

            FROM PRICE_HISTORY

            WHERE stock_id = %s

            ORDER BY trade_date
        """, (
            stock["stock_id"],
        ))

        prices = cursor.fetchall()


        if len(prices) < 2:

            return jsonify({
                "error": "Not enough historical price data"
            }), 400


        first_price = float(
            prices[0]["close_price"]
        )

        last_price = float(
            prices[-1]["close_price"]
        )

        total_return = (
            (last_price - first_price)
            / first_price
        ) * 100


        return jsonify({

            "symbol": stock["symbol"],

            "company_name": stock["company_name"],

            "start_date": prices[0]["trade_date"],

            "end_date": prices[-1]["trade_date"],

            "start_price": first_price,

            "end_price": last_price,

            "total_return_percent": total_return

        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# WATCHLIST - GET
# ============================================================

@app.route("/api/watchlist", methods=["GET"])
def get_watchlist():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT

                w.watchlist_id,

                w.added_at,

                s.stock_id,
                s.symbol,
                s.company_name,
                s.sector,

                f.current_price,
                f.market_cap,
                f.pe_ratio,
                f.roe,
                f.debt

            FROM WATCHLIST w

            INNER JOIN STOCKS s
                ON w.stock_id = s.stock_id

            LEFT JOIN FUNDAMENTALS_SNAPSHOT f
                ON s.stock_id = f.stock_id

            ORDER BY w.added_at DESC
        """)

        watchlist = cursor.fetchall()

        for item in watchlist:

            if item["added_at"] is not None:
                item["added_at"] = item["added_at"].isoformat()

        return jsonify({

            "count": len(watchlist),

            "watchlist": watchlist

        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# WATCHLIST - ADD
# ============================================================

@app.route("/api/watchlist/add", methods=["POST"])
def add_to_watchlist():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "JSON data is required"
        }), 400

    symbol = data.get(
        "symbol",
        ""
    ).upper().strip()

    if not symbol:

        return jsonify({
            "error": "Stock symbol is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # ----------------------------------------------------
        # Find stock
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                stock_id,
                symbol,
                company_name

            FROM STOCKS

            WHERE symbol = %s
        """, (
            symbol,
        ))

        stock = cursor.fetchone()

        if stock is None:

            return jsonify({
                "error": "Stock not found"
            }), 404


        # ----------------------------------------------------
        # Check duplicate
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                watchlist_id

            FROM WATCHLIST

            WHERE stock_id = %s
        """, (
            stock["stock_id"],
        ))

        existing = cursor.fetchone()

        if existing is not None:

            return jsonify({
                "error": "Stock already exists in watchlist"
            }), 409


        # ----------------------------------------------------
        # Add stock
        # ----------------------------------------------------

        cursor.execute("""
            INSERT INTO WATCHLIST (
                stock_id
            )

            VALUES (%s)
        """, (
            stock["stock_id"],
        ))

        connection.commit()


        return jsonify({

            "message": "Stock added to watchlist",

            "symbol": stock["symbol"],

            "company_name": stock["company_name"]

        }), 201

    finally:

        cursor.close()
        connection.close()


# ============================================================
# WATCHLIST - REMOVE
# ============================================================

@app.route("/api/watchlist/remove", methods=["DELETE"])
def remove_from_watchlist():

    symbol = request.args.get(
        "symbol",
        ""
    ).upper().strip()

    if not symbol:

        return jsonify({
            "error": "Stock symbol is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                stock_id

            FROM STOCKS

            WHERE symbol = %s
        """, (
            symbol,
        ))

        stock = cursor.fetchone()

        if stock is None:

            return jsonify({
                "error": "Stock not found"
            }), 404


        cursor.execute("""
            DELETE FROM WATCHLIST

            WHERE stock_id = %s
        """, (
            stock["stock_id"],
        ))

        if cursor.rowcount == 0:

            return jsonify({
                "error": "Stock is not in watchlist"
            }), 404


        connection.commit()


        return jsonify({

            "message": "Stock removed from watchlist",

            "symbol": symbol

        })

    finally:

        cursor.close()
        connection.close()


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )