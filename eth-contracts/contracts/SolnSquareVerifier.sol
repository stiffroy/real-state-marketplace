pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";
import "./Verifier.sol";

// define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract SquareVerifier is Verifier {}

// define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is BariToken {

    SquareVerifier squareVerifier;

    constructor(address _address) public {
        squareVerifier = SquareVerifier(_address);
    }

    // define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address addr;
    }

    // define an array of the above struct
    Solution[] solutions;

    // define a mapping to store unique solutions submitted
    mapping (bytes32 => Solution) solutionsMap;

    // Create an event to emit when a solution is added
    event SolutionAdded(uint256 index, address addr);

    event TokenMinted(uint256 index, address addr);

    // Create a function to add the solutions to the array and emit the event
    function addSolution(uint256 _index, address _addr, bytes32 key) public {
        Solution memory newSolution = Solution({
            index: _index,
            addr: _addr
        });

        solutionsMap[key] = newSolution;
        solutions.push(newSolution);
        emit SolutionAdded(_index, _addr);
    }

    // Create a function to mint new NFT only after the solution has been verified
    function mintNFT
    (
        address to,
        uint256 tokenId,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
    public
    {
        //  - make sure the solution is unique (has not been used before)
        bool verification = squareVerifier.verifyTx(a, b, c, input);
        require(verification, "Zokrates verification failed");
        //  - make sure you handle metadata as well as tokenSupply
        bytes32 _key = generateSolutionKey(a, b, c, input, tokenId);
        require(solutionsMap[_key].addr == address(0), "Solution already exists");
        addSolution(tokenId, to, _key);

        super.mint(to, tokenId);
        emit TokenMinted(tokenId, to);
    }

    function generateSolutionKey
    (
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input,
        uint256 tokenId
    )
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(a, b, c, input, tokenId));
    }
}
