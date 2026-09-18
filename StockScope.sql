-- CREATE DATABASE stockscope;
-- USE stockscope;
-- SELECT DATABASE();
-- USE stockscope;

-- CREATE TABLE STOCKS (
--     stock_id INT AUTO_INCREMENT PRIMARY KEY,
--     symbol VARCHAR(20) NOT NULL UNIQUE,
--     company_name VARCHAR(100),
--     sector VARCHAR(100),
--     industry VARCHAR(100)
-- );

-- CREATE TABLE PRICE_HISTORY (
--     price_id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     stock_id INT NOT NULL,
--     trade_date DATE NOT NULL,
--     open_price DECIMAL(12,2),
--     high_price DECIMAL(12,2),
--     low_price DECIMAL(12,2),
--     close_price DECIMAL(12,2),
--     adj_close DECIMAL(12,2),
--     volume BIGINT,

--     FOREIGN KEY (stock_id)
--         REFERENCES STOCKS(stock_id),

--     UNIQUE (stock_id, trade_date),

--     INDEX idx_stock_date (stock_id, trade_date)
-- );
-- USE stockscope;

--  CREATE TABLE FUNDAMENTALS_SNAPSHOT (
--     fundamental_id BIGINT AUTO_INCREMENT PRIMARY KEY,

--     stock_id INT NOT NULL,
--     as_of_date DATE NOT NULL,

--     market_cap DECIMAL(18,2),
--     current_price DECIMAL(12,2),
--     high_price DECIMAL(12,2),
--     low_price DECIMAL(12,2),

--     pe_ratio DECIMAL(12,2),
--     book_value DECIMAL(12,2),
--     dividend_yield DECIMAL(12,2),
--     roce DECIMAL(12,2),
--     roe DECIMAL(12,2),
--     face_value DECIMAL(12,2),
--     price_to_sales DECIMAL(12,2),

--     sales_growth DECIMAL(12,2),
--     sales_growth_3y DECIMAL(12,2),
--     sales_growth_5y DECIMAL(12,2),
--     sales_growth_7y DECIMAL(12,2),
--     sales_growth_10y DECIMAL(12,2),

--     profit_growth DECIMAL(12,2),
--     profit_growth_3y DECIMAL(12,2),
--     profit_growth_5y DECIMAL(12,2),
--     profit_growth_7y DECIMAL(12,2),
--     profit_growth_10y DECIMAL(12,2),

--     eps DECIMAL(12,2),
--     eps_last_year DECIMAL(12,2),

--     debt DECIMAL(18,2),
--     debt_3y_back DECIMAL(18,2),
--     debt_5y_back DECIMAL(18,2),
--     debt_7y_back DECIMAL(18,2),
--     debt_10y_back DECIMAL(18,2),

--     source_file VARCHAR(255),

--     FOREIGN KEY (stock_id)
--         REFERENCES STOCKS(stock_id),

--     UNIQUE (stock_id, as_of_date),

--     INDEX idx_fundamentals_stock_date (stock_id, as_of_date)
-- );
-- USE stockscope;

-- CREATE TABLE WATCHLIST (
--     watchlist_id INT AUTO_INCREMENT PRIMARY KEY,
--     stock_id INT NOT NULL,
--     added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (stock_id)
--         REFERENCES STOCKS(stock_id)
--         ON DELETE CASCADE,

--     UNIQUE (stock_id)
-- );