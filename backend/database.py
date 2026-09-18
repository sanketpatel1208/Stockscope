import mysql.connector


DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "Stockscope$1201",
    "database": "stockscope"
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def test_connection():
    try:
        connection = get_connection()

        if connection.is_connected():
            print("MySQL connection successful.")

            cursor = connection.cursor()

            cursor.execute("SELECT COUNT(*) FROM STOCKS")
            result = cursor.fetchone()

            print("Stocks in database:", result[0])

            cursor.close()
            connection.close()

    except mysql.connector.Error as error:
        print("MySQL Error:", error)


if __name__ == "__main__":
    test_connection()