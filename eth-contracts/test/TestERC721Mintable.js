let ERC721Mintable = artifacts.require('BariToken');

contract('TestERC721Mintable', accounts => {
    const account_one = accounts[0];
    const account_two = accounts[1];
    const totalTokens = 7;
    let tokenCount = [];

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721Mintable.new({from: account_one});
            tokenCount[account_one] = 0;
            tokenCount[account_two] = 0;

            // TODO: mint multiple tokens
            let account = account_one;

            for (let i = 1; i <= totalTokens; i++) {
                this.contract.mint(account, i);
                tokenCount[account] = tokenCount[account] + 1;
                account = account === account_one ? account_two : account_one;
            }
        })

        it('should return total supply', async function () {
            // Arrange
            let totalNumbers = totalTokens;

            // Act
            let totalSupply = await this.contract.totalSupply();

            // Assert
            assert.equal(totalNumbers, totalSupply, "Total supply does not match");
        })

        it('should get token balance', async function () {
            // Arrange
            let balanceOfAccountOne = tokenCount[account_one];
            let balanceOfAccountTwo = tokenCount[account_two];

            // Act
            let accountOneBalance = await this.contract.balanceOf(account_one);
            let accountTwoBalance = await this.contract.balanceOf(account_two);

            // Assert
            assert.equal(balanceOfAccountOne, accountOneBalance, "Balance of account one does not match");
            assert.equal(balanceOfAccountTwo, accountTwoBalance, "Balance of account two does not match");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            // Arrange
            let baseURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';

            for (let i = 1; i <= totalTokens; i++) {
                // Act
                let tokenURI = await this.contract.tokenURI(i);

                // Assert
                assert.equal(tokenURI, baseURI + i, "Token URI does not match");
            }
        })

        it('should transfer token from one owner to another', async function () {
            // Arrange
            let owner = await this.contract.ownerOf(1);
            let receiver = owner === account_one ? account_two : account_one;

            // Act
            await this.contract.transferFrom(owner, receiver, 1);
            let transferredTo = await this.contract.ownerOf(1);

            // Assert
            assert.equal(receiver, transferredTo, "Token not transferred");
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721Mintable.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            // Arrange
            let tokenId = 8;
            let result = undefined;
            let falseOwner = account_two;

            // Act
            try {
                result = await this.contract.mint(account_one, tokenId, {from: falseOwner});
            } catch (e) {
                result = false;
            }

            // Assert
            assert.equal(result, false, "Token minting not checking for the ownership");
        })

        it('should return contract owner', async function () {
            // Arrange
            let owner = account_one;

            // Act
            let result = await this.contract.getOwner();

            // Assert
            assert.equal(result, owner, "This is not a proper owner");
        })
    });
})
