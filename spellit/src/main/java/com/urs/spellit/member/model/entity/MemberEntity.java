package com.urs.spellit.member.model.entity;

import com.urs.spellit.common.model.BaseTimeEntity;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamicInsert
@DynamicUpdate
public class MemberEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id", nullable = false)
    private Long id;

    @Column(nullable = false, length = 40)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(length = 7)
    private String nickname;
    @Column(nullable = false)
    @ColumnDefault("1")
    private int level;
    @Column(nullable = false)
    @ColumnDefault("0")
    private int exp;
    @Column(nullable = false)
    @ColumnDefault("0")
    private int playCount;
    @Column(nullable = false)
    @ColumnDefault("0")
    private int winCount;
    @Column(nullable = false)
    @ColumnDefault("0")
    private int gameCharacter;

    @Column
    @ColumnDefault("false")
    private boolean isDeleted;
}