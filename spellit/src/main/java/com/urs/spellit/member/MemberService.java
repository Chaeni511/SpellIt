package com.urs.spellit.member;

import com.urs.spellit.common.util.SecurityUtil;
import com.urs.spellit.game.CardRepository;
import com.urs.spellit.game.DeckRepository;
import com.urs.spellit.game.GameService;
import com.urs.spellit.game.entity.CardEntity;
import com.urs.spellit.game.entity.DeckEntity;
import com.urs.spellit.game.entity.GameCharacterEntity;
import com.urs.spellit.member.model.dto.*;
import com.urs.spellit.member.model.entity.FriendWaitEntity;
import com.urs.spellit.member.model.entity.Member;
import com.urs.spellit.websocket.dto.PlayerDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private Logger log = LoggerFactory.getLogger(MemberService.class);

    private final GameService gameService;
    private final MemberRepository memberRepository;
    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final FriendWaitRepository friendWaitRepository;

    public MemberResponseDto findMemberInfoById(Long memberId)
    {
        Optional<Member> optional = memberRepository.findById(memberId);
        if(optional.isEmpty()) {
            throw new RuntimeException("로그인 유저 정보가 없습니다.");
        }
        MemberResponseDto member = MemberResponseDto.of(optional.get());
        member.setDeck(this.getUserDeck(memberId));
        return member;
    }
    /*public MemberResponseDto findMemberInfoByEmail(String email)
    {
        return memberRepository.findByEmail(email)
                .map(MemberResponseDto::of)
                .orElseThrow(()->new RuntimeException("유저 정보가 없습니다."));
    }*/


    public List<CardEntity> getUserDeck(Long memberId) {
        List<DeckEntity> deckEntities = deckRepository.findAllByMemberId(memberId);
        List<CardEntity> deck = new ArrayList<>();
        for(DeckEntity d : deckEntities) {
            deck.add(d.getCard());
        }
        return deck;
    }

    public GameCharacterEntity setMyCharacter(GameCharacterEntity gameCharacterEntity) {
        GameCharacterEntity gameCharacter=gameService.getCharacter(gameCharacterEntity.getId()); //캐릭터ID에 대응하는 개체 (ex. 곽춘배)
        Optional<Member> member=memberRepository.findById(SecurityUtil.getCurrentMemberId()); //id로 멤버레포의 멤버 찾음 (ex. 이재완)
        member.get().changeGameCharacter(gameCharacter); //이재완의 gamecharacter = 곽춘배
        memberRepository.save(member.get());
        return gameCharacterEntity; //곽춘배 반환
    }

    public MemberRecordResponseDto updateRecord(MemberRecordRequestDto memberRecordRequestDto)
    {
        Optional<Member> member=memberRepository.findById(SecurityUtil.getCurrentMemberId());
        member.get().changeRecord(memberRecordRequestDto);
        memberRepository.save(member.get());
        return MemberRecordResponseDto.of(member.get());
    }

    public List<CardEntity> setUserDeck(List<CardEntity> cardEntities) {
        Optional<Member> member=memberRepository.findById(SecurityUtil.getCurrentMemberId());
        deckRepository.deleteAllByMemberId(SecurityUtil.getCurrentMemberId());
        List<CardEntity> cards= new ArrayList<>();
        for(CardEntity cardEntity : cardEntities)
        {
            try {
                long cardId = cardEntity.getId();
                cards.add(cardRepository.findById(cardId));
            }
            catch(Exception e)
            {
                throw new RuntimeException("존재하지 않는 카드입니다.");
            }
        }

        member.get().setUserDeck(DeckEntity.toDeck(deckRepository,member.get(),cards));
        memberRepository.save(member.get());
        return this.getUserDeck(member.get().getId());
    }

    public FriendWaitResponseDto addFriendWait(FriendWaitRequestDto friendWaitRequestDto) {
        Long friendId=friendWaitRequestDto.getFriendId(); //친구Id
        String friendEmail=memberRepository.findById(friendId).get().getEmail(); //친구Email
        Member member=memberRepository.findById(SecurityUtil.getCurrentMemberId()).get(); //나
        Member friend=memberRepository.findById(friendId).get(); //친구

        List<FriendWaitEntity> friendWaitEntities=friendWaitRepository.findAllByMemberId(friendId); //상대의 친구대기 리스트

        if(friendId==member.getId())
            throw new RuntimeException(("나에게 친구요청을 보낼 수 없습니다."));

        for(FriendWaitEntity friendWaitEntity : friendWaitEntities)
        {
            if(member.getId()==friendWaitEntity.getFriendId()) //내가 이미 상대의 친구 대기 리스트에 있음
                throw new RuntimeException("이미 친구요청을 보낸 상대입니다.");
        }

        //친구 대기 리스트에 없음//

        FriendWaitEntity friendWaitEntity=FriendWaitEntity.toBuild(member.getId(), member.getEmail(), friend); //나 대기 객체 생성
        friendWaitEntities.add(friendWaitEntity); //상대의 친구 대기 리스트에 나를 추가
        friend.changeFriendWaitList(friendWaitEntities);
        friendWaitRepository.save(friendWaitEntity); //친구 대기 리스트 저장

        return FriendWaitResponseDto.toResponse(friendWaitEntity); //친구Id, 내 Id 반환
    }

    public void playerOnline(long memberId) {
        Optional<Member> playerOpt = memberRepository.findById(memberId);
        if(playerOpt.isEmpty()) return;
        Member player = playerOpt.get();
        player.setIsOnline(true);
        memberRepository.save(player);
    }

    public void playerOffline(long memberId) {
        Optional<Member> playerOpt = memberRepository.findById(memberId);
        if(playerOpt.isEmpty()) return;
        Member player = playerOpt.get();
        player.setIsOnline(false);
        memberRepository.save(player);
    }
}