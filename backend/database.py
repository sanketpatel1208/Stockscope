import os
import mysql.connector

DB_CONFIG = {
    "host": os.environ.get("DB_HOST"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER"),
    "password": os.environ.get("DB_PASSWORD"),
    "database": os.environ.get("DB_NAME", "stockscope"),

    # Aiven SSL
    "ssl_ca": os.path.join(os.path.dirname(__file__), "ca.pem"),
    "ssl_verify_cert": True,
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
