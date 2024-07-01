const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { getBigInt, toBigInt } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let MockV3Aggregator
          const sendValue = ethers.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Not enough funds.!"
                  )
              })
              it("Updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("Withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async function () {
                  //Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  // console.log(gasUsed, effectiveGasPrice)
                  const gasCost = gasUsed * gasPrice

                  //gasCost

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
              })
              it("Allow us to withdraw with multiple funders", async function () {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedAccounts = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedAccounts.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasPrice * gasUsed

                  //Assert
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
          it("withdraw ETH from a single founder", async function () {
              //Arrange
              const startingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              const startingDeployerBalance = await ethers.provider.getBalance(
                  deployer
              )
              //Act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, gasPrice } = transactionReceipt
              // console.log(gasUsed, effectiveGasPrice)
              const gasCost = gasUsed * gasPrice

              //gasCost

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              const endingDeployerBalance = await ethers.provider.getBalance(
                  deployer
              )
              //Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  (startingFundMeBalance + startingDeployerBalance).toString(),
                  (endingDeployerBalance + gasCost).toString()
              )
          })
          it("Allow us to withdraw with multiple funders", async function () {
              //Arrange
              const accounts = await ethers.getSigners()
              for (let i = 1; i < 6; i++) {
                  const fundMeConnectedAccounts = await fundMe.connect(
                      accounts[i]
                  )
                  await fundMeConnectedAccounts.fund({ value: sendValue })
              }
              const startingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              const startingDeployerBalance = await ethers.provider.getBalance(
                  deployer
              )

              //Act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, gasPrice } = transactionReceipt
              const gasCost = gasPrice * gasUsed

              //Assert
              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target
              )
              const endingDeployerBalance = await ethers.provider.getBalance(
                  deployer
              )
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  (startingFundMeBalance + startingDeployerBalance).toString(),
                  (endingDeployerBalance + gasCost).toString()
              )

              await expect(fundMe.getFunder(0)).to.be.reverted

              for (i = 1; i < 6; i++) {
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[i].address
                      ),
                      0
                  )
              }
          })
      })
