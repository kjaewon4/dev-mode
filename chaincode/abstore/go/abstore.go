// 📁 chaincode/abstore/abstore.go
package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// LoanRequest 구조체
type LoanRequest struct {
	ID           string `json:"id"`
	Requester    string `json:"requester"`
	Receiver     string `json:"receiver"`
	Amount       int    `json:"amount"`
	DurationDays int    `json:"durationDays"`
	InterestRate int    `json:"interestRate"`
	Status       string `json:"status"`
	StartTime    int64  `json:"startTime"`
}

// 체인코드 구조체
type LoanContract struct {
	contractapi.Contract
}

// 대출 요청 생성
func (t *LoanContract) CreateLoanRequest(ctx contractapi.TransactionContextInterface, id, requester, receiver string, amount, durationDays, interestRate int) error {
	exists, err := t.LoanRequestExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("loan request %s already exists", id)
	}

	loan := LoanRequest{
		ID:           id,
		Requester:    requester,
		Receiver:     receiver,
		Amount:       amount,
		DurationDays: durationDays,
		InterestRate: interestRate,
		Status:       "pending",
		StartTime:    0,
	}

	loanJSON, err := json.Marshal(loan)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, loanJSON)
}

// 대출 상태 변경
func (t *LoanContract) UpdateLoanStatus(ctx contractapi.TransactionContextInterface, id, newStatus string) error {
	loanJSON, err := ctx.GetStub().GetState(id)
	if err != nil || loanJSON == nil {
		return fmt.Errorf("loan request %s does not exist", id)
	}

	var loan LoanRequest
	err = json.Unmarshal(loanJSON, &loan)
	if err != nil {
		return err
	}

	loan.Status = newStatus
	if newStatus == "active" {
		loan.StartTime = time.Now().Unix()
	}

	updatedLoanJSON, err := json.Marshal(loan)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, updatedLoanJSON)
}

// 단일 대출 요청 조회
func (t *LoanContract) QueryLoanRequest(ctx contractapi.TransactionContextInterface, id string) (*LoanRequest, error) {
	loanJSON, err := ctx.GetStub().GetState(id)
	if err != nil || loanJSON == nil {
		return nil, fmt.Errorf("loan request %s does not exist", id)
	}

	var loan LoanRequest
	err = json.Unmarshal(loanJSON, &loan)
	if err != nil {
		return nil, err
	}

	return &loan, nil
}

// 전체 대출 요청 조회
func (t *LoanContract) QueryAllLoanRequests(ctx contractapi.TransactionContextInterface) ([]*LoanRequest, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var loans []*LoanRequest
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var loan LoanRequest
		err = json.Unmarshal(queryResponse.Value, &loan)
		if err == nil {
			loans = append(loans, &loan)
		}
	}
	return loans, nil
}

// 대출 요청 존재 여부
func (t *LoanContract) LoanRequestExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	loanJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, err
	}
	return loanJSON != nil, nil
}

func main() {
	cc, err := contractapi.NewChaincode(new(LoanContract))
	if err != nil {
		panic(err.Error())
	}

	if err := cc.Start(); err != nil {
		fmt.Printf("Error starting LoanContract chaincode: %s", err)
	}
}
