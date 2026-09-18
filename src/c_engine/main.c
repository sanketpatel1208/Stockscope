#include <stdio.h>
#include <string.h>

#include "stock.h"


int main()
{
    Stock stocks[MAX_STOCKS];

    int count;

    int choice;

    char symbol[20];

    int index;


    /*
        Load stock data
    */

    count = loadStocks(
        stocks,
        "stock_data.csv"
    );


    if (count == 0)
    {
        printf("No stock data loaded.\n");
        return 1;
    }


    printf("\n");
    printf("====================================================\n");
    printf("              STOCKSCOPE C ENGINE\n");
    printf("====================================================\n");

    printf("Stocks loaded: %d\n", count);


    do
    {
        printf("\n");
        printf("--------------- MENU ----------------\n");

        printf("1. Display all stocks\n");
        printf("2. Search stock\n");
        printf("3. Sort by P/E ratio\n");
        printf("4. Sort by ROE\n");
        printf("5. Screen stocks\n");
        printf("0. Exit\n");

        printf("--------------------------------------\n");

        printf("Enter choice: ");
        scanf("%d", &choice);


        switch (choice)
        {

            case 1:

                displayAllStocks(
                    stocks,
                    count
                );

                break;


            case 2:

                printf("\nEnter stock symbol: ");

                scanf("%19s", symbol);

                index = searchStock(
                    stocks,
                    count,
                    symbol
                );


                if (index != -1)
                {
                    displayStock(
                        &stocks[index]
                    );
                }
                else
                {
                    printf("\nStock not found.\n");
                }

                break;


            case 3:

                sortByPE(
                    stocks,
                    count
                );

                printf("\nStocks sorted by P/E ratio.\n");

                displayAllStocks(
                    stocks,
                    count
                );

                break;


            case 4:

                sortByROE(
                    stocks,
                    count
                );

                printf("\nStocks sorted by ROE.\n");

                displayAllStocks(
                    stocks,
                    count
                );

                break;


            case 5:

                screenStocks(
                    stocks,
                    count,
                    25.0,
                    15.0,
                    10000.0
                );

                break;


            case 0:

                printf("\nExiting StockScope C Engine...\n");

                break;


            default:

                printf("\nInvalid choice.\n");
        }

    }
    while (choice != 0);


    return 0;
}
