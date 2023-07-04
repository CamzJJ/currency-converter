import { useEffect, useState } from "react";

export default function App() {
  // `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`
  // `https://api.frankfurter.app/currencies`
  const [inputAmount, setInputAmount] = useState(1);
  const [curPrimary, setCurPrimary] = useState("GBP");
  const [curSecondary, setCurSecondary] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currencies, setCurrencies] = useState({});
  const [conversion, setConversion] = useState({
    amount: 100.0,
    base: "EUR",
    date: "2023-07-04",
    rates: { USD: 108.95 },
  });

  console.log(isLoading);
  console.log(error);
  useEffect(function () {
    const controller = new AbortController();
    async function fetchConversion() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`https://api.frankfurter.app/currencies`, {
          signal: controller.signal,
        });

        // If the response fails
        if (!res.ok) throw new Error("Something went wrong");

        const data = await res.json();
        // If the movie cannot be found
        if (data.Response === "False") throw new Error("not found");

        setCurrencies(data);
        console.log(data);
      } catch (err) {
        // catching the errors to console log them

        if (err.name !== `AbortError`) {
          setError(err.message);
        }
      } finally {
        // removed loading animation
        setIsLoading(false);
      }
    }
    fetchConversion();
    return function () {
      controller.abort();
    };
  }, []);

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchCurrencies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${inputAmount}&from=${curPrimary}&to=${curSecondary}`,
            { signal: controller.signal }
          );

          // If the response fails
          if (!res.ok) throw new Error("Something went wrong");

          const data = await res.json();
          // If the movie cannot be found
          if (data.Response === "False") throw new Error("not found");

          setConversion(data);
          console.log(data);
        } catch (err) {
          // catching the errors to console log them

          if (err.name !== `AbortError`) {
            setError(err.message);
          }
        } finally {
          // removed loading animation
          setIsLoading(false);
        }
      }
      fetchCurrencies();
      return function () {
        controller.abort();
      };
    },
    [inputAmount, curPrimary, curSecondary]
  );

  return (
    <div className="container">
      <CurrencyConverter
        currencies={currencies}
        inputAmount={inputAmount}
        setInputAmount={setInputAmount}
        curPrimary={curPrimary}
        setCurPrimary={setCurPrimary}
        curSecondary={curSecondary}
        setCurSecondary={setCurSecondary}
        conversion={conversion}
      />
    </div>
  );
}

function CurrencyConverter({
  currencies,
  inputAmount,
  setInputAmount,
  curPrimary,
  setCurPrimary,
  curSecondary,
  setCurSecondary,
  conversion,
}) {
  return (
    <div className="currency-converter">
      <Header />
      <div className="currency-converter__calculator">
        <CurrencyInput
          currencies={currencies}
          inputAmount={inputAmount}
          setInputAmount={setInputAmount}
          curPrimary={curPrimary}
          setCurPrimary={setCurPrimary}
          curSecondary={curSecondary}
          setCurSecondary={setCurSecondary}
        />
        <CurrencyOutput inputAmount={inputAmount} conversion={conversion} />
        {/* <Loader /> */}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <h1>MoneySwitch</h1>
    </header>
  );
}

function CurrencyInput({
  currencies,
  inputAmount,
  setInputAmount,
  curPrimary,
  setCurPrimary,
  curSecondary,
  setCurSecondary,
}) {
  function handleSubmit(event) {
    event.preventDefault();
  }
  return (
    <div className="currency-converter__input">
      <form className="currency-converter__form">
        <TextField inputAmount={inputAmount} setInputAmount={setInputAmount} />
        <div className="currency-converter__form-group">
          <SelectField
            currencies={currencies}
            val={curPrimary}
            setFunction={setCurPrimary}
          />
          <SelectField
            currencies={currencies}
            val={curSecondary}
            setFunction={setCurSecondary}
          />
        </div>
        <button className="btn" onClick={handleSubmit}>
          Exchange
        </button>
      </form>
    </div>
  );
}

// function Loader() {
//   return (
//     <div className="loader__container">
//       <span className="loader">&nbsp;</span>
//     </div>
//   );
// }

function TextField({ inputAmount, setInputAmount }) {
  return (
    <input
      className="form__input form__input--number"
      type="number"
      value={inputAmount}
      onChange={(event) => setInputAmount(Number(event.target.value))}
      placeholder="Enter amount"
    />
  );
}

function SelectField({ currencies, val, setFunction }) {
  const currency = Object.keys(currencies);
  return (
    <select
      className="form__input form__input--select"
      value={val}
      onChange={(event) => setFunction(String(event.target.value))}
    >
      {currency.map((cur) => (
        <option key={cur} value={cur}>
          {`${cur}`}
        </option>
      ))}
    </select>
  );
}
// ------------

function CurrencyOutput({ inputAmount, conversion }) {
  return (
    <div className="currency-converter__output">
      <CurrencyRates inputAmount={inputAmount} conversion={conversion} />
      <CurrencyTotal conversion={conversion} />
    </div>
  );
}

function CurrencyRates({ inputAmount, conversion }) {
  const result = conversion.rates;
  return (
    <div className="currency-converter__output--rates">
      <h2>Exchange of:</h2>
      <p>
        <span>1.00</span>
        &rarr;
        <span>{(Object.values(result) / inputAmount).toFixed(2)}</span>
      </p>
    </div>
  );
}
function CurrencyTotal({ conversion }) {
  const result = conversion.rates;

  return (
    <div className="currency-converter__output--result">
      <h2>TOTAL:</h2>
      <p>
        {Number(Object.values(result)).toFixed(2)}
        <span>{Object.keys(result)}</span>
      </p>
    </div>
  );
}
