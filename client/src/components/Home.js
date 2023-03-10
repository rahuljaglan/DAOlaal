import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Trade from './Trade';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Buy from './Buy';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'left',
  paddingLeft: 10,
  paddingTop: 10,
  color: theme.palette.text.secondary,
  lineHeight: '60px',
}));

const StyledTitle = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.7)',
}));

const STitle = styled(Typography)(() => ({
  color: '#03DAC5',
}));
const StyledText = styled(Typography)(() => ({
  // color: 'white'
}));

const BalanceGrid = styled(Paper)(({ theme }) => ({
  border: '1px solid',
  borderColor: '#03DAC5',
  borderRadius: '10px',
  height: '80vh',
  textAlign: 'left',
  // paddingLeft: 10,
  // paddingTop: 10,
  padding: 20,
  lineHeight: '60px',
  color: theme.palette.text.secondary,
}));

const StyledButton = styled(Button)(() => ({
  borderColor: '#03DAC5',
  color: '#03DAC5',
  width: '97%',
}));

const darkTheme = createTheme({ palette: { mode: 'dark' } });
export default function Home({
  web3,
  accounts,
  tokenContract,
  callerContract,
}) {
  const [mintSymbol, setMintSymbol] = useState('BSE:RELIANCE');
  const [mintQuantity, setMintQuantity] = useState(0);
  const [burnSymbol, setBurnSymbol] = useState('BSE:RELIANCE');
  const [burnQuantity, setBurnQuantity] = useState(0);
  const [ispriceFetched, setBool] = useState(false);
  const [price, setPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [inrPrice, setInrPrice] = useState(0);
  const [collateralRatio, setRatio] = useState(1.5);
  const [currentCollateral, setCollateral] = useState(0);
  const [maticToInrRatio, setMaticToInr] = useState(0);
  useEffect(() => {
    if (callerContract != null && ispriceFetched == false) {
      getPrice();
    }
  }, [{ callerContract }]);

  async function getPrice() {
    const updatePrice = callerContract.methods
      .updatePrice(mintSymbol)
      .send({ from: accounts[0] });
    var price = await callerContract.methods
      .readUpdatedprice(mintSymbol)
      .call();
    var balance = await tokenContract.methods
      .viewBalance(mintSymbol, accounts[0])
      .call();
    balance /= 10000000000;
    var collateral = await tokenContract.methods
      .getCollateral(accounts[0])
      .call();
    collateral /= 10000000000;
    const inrPrice = await callerContract.methods.readPrice(mintSymbol).call();
    const maticToInr = await callerContract.methods.maticToInr().call();
    setMaticToInr(maticToInr);
    setCollateral(collateral);
    setInrPrice(inrPrice);
    setBalance(balance);
    setPrice(price);
    setBool(true);
  }
  function handleMintQuantity(event) {
    setMintQuantity(event.target.value);
  }
  function handleMintSymbol(event) {
    setMintSymbol(event.target.value);
  }
  function handleBurnQuantity(event) {
    setBurnQuantity(event.target.value);
  }
  function handleBurnSymbol(event) {
    setBurnSymbol(event.target.value);
  }
  function handleCollateralRation(event) {
    setRatio(event.target.value);
  }
  async function mint() {
    const amount = web3.utils.toWei(mintQuantity);
    await tokenContract.methods
      .buyToken(mintSymbol, mintQuantity * 10000000000, accounts[0])
      .send({
        from: accounts[0],
        value: amount * price * collateralRatio,
        to: '0xA963aB65320C16a581eeb264125C5fF1FcE58985',
      });
    console.log('mint quantity', mintQuantity);
    console.log('price', price);
    console.log('col ratio', collateralRatio);
    console.log('mToInr ratio', maticToInrRatio);
    console.log(
      Math.trunc(
        mintQuantity * price * collateralRatio * maticToInrRatio * 10000000000
      )
    );
    await tokenContract.methods
      .incCollateral(
        accounts[0],
        Math.trunc(
          mintQuantity * price * collateralRatio * maticToInrRatio * 10000000000
        )
      )
      .send({ from: accounts[0] });
    var balance = await tokenContract.methods
      .viewBalance(mintSymbol, accounts[0])
      .call();
    var collateral = await tokenContract.methods
      .getCollateral(accounts[0])
      .call();
    collateral /= 10000000000;
    balance /= 10000000000;
    console.log(collateral);
    setCollateral(collateral);
    setBalance(balance);
    setMintQuantity(0);
  }
  async function burn() {
    await tokenContract.methods
      .burnToken(burnSymbol, burnQuantity * 10000000000, accounts[0])
      .send({ from: accounts[0] });
    await tokenContract.methods
      .decCollateral(
        accounts[0],
        mintQuantity * price * collateralRatio * maticToInrRatio * 10000000000
      )
      .send({ from: accounts[0] });
    var balance = await tokenContract.methods
      .viewBalance(mintSymbol, accounts[0])
      .call();
    var collateral = await tokenContract.methods
      .getCollateral(accounts[0])
      .call();
    collateral /= 10000000000;
    setCollateral(collateral);
    console.log(collateral);
    balance /= 10000000000;
    setBalance(balance);
    setBurnQuantity(0);
  }
  return (
    <ThemeProvider theme={darkTheme} styles={{ height: '100vh' }}>
      <Box
        sx={{
          p: 2,
          paddingTop: '10vh',
          bgcolor: 'background.default',
          display: 'grid',
          // height: '100vh'
        }}
      >
        <STitle variant="h4" pb={1} pl={11}>
          DAOfinance
        </STitle>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Grid item xs={6}>
            <Grid
              container
              direction="column"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Grid item>
                <Item elevation={1} style={{ height: '35vh', width: '35vw' }}>
                  <StyledText variant="h4">Mint</StyledText>
                  <Grid container pt={3} pb={1}>
                    <Grid item xs={3}>
                      <Input
                        type="number"
                        inputProps={{ min: '0' }}
                        placeholder="Quantity"
                        onChange={handleMintQuantity}
                      />
                    </Grid>
                    <Grid item xs={4} pl={2}>
                      <Input
                        variant="standard"
                        type="number"
                        inputProps={{ min: '1.5', step: '0.5' }}
                        placeholder="Collateral Ratio"
                        onChange={handleCollateralRation}
                      />
                    </Grid>
                    <Grid item xs={3} pl={3}>
                      <Select
                        variant="standard"
                        value={mintSymbol}
                        label="Symbol"
                        onChange={handleMintSymbol}
                      >
                        <MenuItem value="BSE:RELIANCE">BSE:RELIANCE</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle1">
                    {' '}
                    Value:{' '}
                    {mintQuantity > 0
                      ? (mintQuantity * price * collateralRatio).toFixed(2)
                      : 0}{' '}
                    MATIC &nbsp; &nbsp; Collateral Ratio: {collateralRatio}
                  </Typography>
                  <StyledButton variant="outlined" onClick={mint}>
                    Mint
                  </StyledButton>
                </Item>
              </Grid>
              <Grid item pt={2}>
                <Item elevation={1} style={{ height: '35vh', width: '35vw' }}>
                  <StyledText variant="h4">Burn</StyledText>
                  <Grid container pt={3}>
                    <Grid item xs={6}>
                      <Input
                        placeholder="Quantity"
                        onChange={handleBurnQuantity}
                      />
                    </Grid>
                    <Grid item pl={2}>
                      <Select
                        variant="standard"
                        value={burnSymbol}
                        label="Symbol"
                        onChange={handleBurnSymbol}
                      >
                        <MenuItem value="BSE:RELIANCE">BSE:RELIANCE</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle1">
                    {' '}
                    Value:{' '}
                    {burnQuantity > 0
                      ? (burnQuantity * price).toFixed(2)
                      : 0}{' '}
                    MATIC
                  </Typography>
                  <StyledButton variant="outlined" onClick={burn}>
                    Burn
                  </StyledButton>
                </Item>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container justifyContent="center">
              <Grid item xs={11}>
                <BalanceGrid variant="outlined">
                  <StyledText variant="h4">Balance</StyledText>
                  <Grid container justifyContent="space-between" pt={5} pb={1}>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography variant="h6" fontWeight="bold">
                          Name
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography variant="h6" fontWeight="bold">
                          Symbol
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography variant="h6" fontWeight="bold">
                          Quantity
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography variant="h6" fontWeight="bold">
                          Collateral %
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container justifyContent="space-between">
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography>{mintSymbol}</Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography>{mintSymbol}</Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography>{balance.toFixed(2)}</Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justifyContent="center">
                        <Typography>
                          {currentCollateral > 0
                            ? (
                                currentCollateral /
                                (balance * inrPrice)
                              ).toFixed(1)
                            : 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </BalanceGrid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Trade mintSymbol={mintSymbol} price={inrPrice} />
        <Grid
          container
          justifyContent="center"
          direction="column"
          style={{ borderRadius: '10px' }}
          pt={5}
          pl="6vw"
        >
          <StyledTitle variant="h4" pb={1}>
            Swap
          </StyledTitle>
          <iframe
            src="https://app.uniswap.org/#/swap?theme=dark"
            height="400px"
            width="93%"
          />
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
